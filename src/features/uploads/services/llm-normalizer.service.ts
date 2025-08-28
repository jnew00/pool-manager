import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export interface NormalizedGameData {
  season: number
  week: number
  kickoff_et: string
  home_team: string
  away_team: string
  fav_team_abbr: string | null
  spread_for_home: number | null
  total: number | null
  moneyline_home: number | null
  moneyline_away: number | null
  is_pickem: boolean
  source_label: string | null
  issues: string[]
}

export interface NormalizedSpreadData {
  home_team: string
  away_team: string
  spread_for_home: number | null
  is_pickem: boolean
  issues: string[]
}

export interface NormalizationResult {
  rows: NormalizedGameData[]
  success: boolean
  error?: string
  provider?: string
  tokensUsed?: number
  costUSD?: number
}

export interface SpreadNormalizationResult {
  spreads: NormalizedSpreadData[]
  success: boolean
  error?: string
  provider?: string
  tokensUsed?: number
  costUSD?: number
}

export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | 'disabled'

interface LLMProviderConfig {
  provider: LLMProvider
  apiKey?: string
  model?: string
  maxTokens?: number
  timeoutMs?: number
  costCapUSD?: number
}

export class LLMNormalizerService {
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private deepseek: OpenAI | null = null // DeepSeek uses OpenAI-compatible API
  private config: LLMProviderConfig

  constructor(config: LLMProviderConfig) {
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders(): void {
    if (this.config.provider === 'openai' && this.config.apiKey) {
      this.openai = new OpenAI({ apiKey: this.config.apiKey })
    }

    if (this.config.provider === 'anthropic' && this.config.apiKey) {
      this.anthropic = new Anthropic({ apiKey: this.config.apiKey })
    }

    if (this.config.provider === 'deepseek' && this.config.apiKey) {
      this.deepseek = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      })
    }
  }

  private getSystemPrompt(): string {
    return `You are a meticulous data normalizer for NFL matchup tables.
Your ONLY output is a JSON object matching the provided JSON Schema exactly.
No explanations. If uncertain, set null and add a note in "issues".
Rules:
- Teams -> NFL abbreviations: ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN, DET, GB, HOU, IND, JAX, KC, LVR, LAC, LAR, MIA, MIN, NE, NO, NYG, NYJ, PHI, PIT, SEA, SF, TB, TEN, WAS.
- '@' means AWAY @ HOME; fill home_team/away_team as abbreviations.
- kickoff_et: ISO-8601 with ET offset, e.g. 2025-09-07T13:00:00-04:00.
- Spread: if "NE -6.5 at NYJ", fav_team_abbr="NE". spread_for_home is +6.5 if HOME is favored; otherwise negative.
- Total/moneylines numeric or null.
- is_pickem=true if |spread| < 0.5 (still fill fields).`
  }

  private getSpreadSystemPrompt(): string {
    return `You are a specialized NFL spread extractor for pool betting lines.
Your ONLY output is a JSON object matching the provided JSON Schema exactly.
No explanations. Focus ONLY on extracting team matchups and spreads.

🚨 CRITICAL PARSING RULES:
1. DETECT THE FORMAT FIRST:
   - If teams appear in pairs on same/adjacent lines: use standard pairing
   - If ALL away teams listed first, then ALL home teams: use VERTICAL COLUMN format
   
2. VERTICAL COLUMN FORMAT (teams in separate blocks):
   - First half of teams = ALL away teams (in order)
   - Second half of teams = ALL home teams (in same order)
   - Match by position: 1st away with 1st home, 2nd away with 2nd home, etc.
   
3. STANDARD FORMAT (teams paired together):
   - LEFT/FIRST team = away_team, RIGHT/SECOND team = home_team
   - For "Cowboys +6.5 Eagles -6.5": away=DAL, home=PHI, spread=-6.5
   
4. SPREAD EXTRACTION:
   - Quote marks (") often mean minus: "6.5 = -6.5
   - Numbers without +/- default to positive
   - Use home team's spread when both shown

NFL TEAM MAPPING (use exact abbreviations in output):
- Cardinals/Arizona/AZ/Card → ARI
- Falcons/Atlanta/GA/Falcon → ATL  
- Ravens/Baltimore/MD/Raven → BAL
- Bills/Buffalo/NY/Bill → BUF
- Panthers/Carolina/NC/Panther/CAR → CAR
- Bears/Chicago/IL/Bear → CHI
- Bengals/Cincinnati/OH/Bengal → CIN
- Browns/Cleveland/OH/Brown → CLE
- Cowboys/Dallas/TX/Cowboy → DAL
- Broncos/Denver/CO/Bronco → DEN
- Lions/Detroit/MI/Lion → DET
- Packers/Green Bay/GB/GNB/Pack → GB
- Texans/Houston/TX/Texan → HOU
- Colts/Indianapolis/IN/Colt → IND
- Jaguars/Jacksonville/JAX/FL/Jags → JAX
- Chiefs/Kansas City/KC/MO/Chief → KC
- Raiders/Las Vegas/LV/Oakland/OAK/Vegas → LVR
- Chargers/Los Angeles/LAC/San Diego/SD/Bolts → LAC
- Rams/Los Angeles/LAR/Ram → LAR
- Dolphins/Miami/FL/Dolphin/Fins → MIA
- Vikings/Minnesota/MN/Viking/Vikes → MIN
- Patriots/New England/NE/MA/Pats → NE
- Saints/New Orleans/NO/LA/Saint → NO
- Giants/New York/NYG/Giant → NYG
- Jets/New York/NYJ/Jet → NYJ
- Eagles/Philadelphia/PHI/PA/Eagle → PHI
- Steelers/Pittsburgh/PIT/PA/Steeler → PIT
- Seahawks/Seattle/SEA/WA/Hawks → SEA
- 49ers/Niners/San Francisco/SF/SFO → SF
- Buccaneers/Bucs/Tampa Bay/TB/TPA/TAM/Tampa → TB
- Titans/Tennessee/TEN/TN/Titan → TEN
- Commanders/Washington/WAS/WSH/DC/Commander → WAS

CRITICAL PARSING RULES:

1. **Home/Away Identification (CRITICAL - READ CAREFULLY):**
   - "@ means AWAY @ HOME" - team after @ is HOME
   - "at" means AWAY at HOME - team after "at" is HOME  
   - "vs" usually means first team is HOME (but check context)
   - **MANDATORY FALLBACK RULE: If there is NO "vs", "@", or "at" indicator, ALWAYS use this rule:**
     - **FIRST/LEFT team mentioned = AWAY team**  
     - **SECOND/RIGHT team mentioned = HOME team**
     - This rule MUST be applied when no explicit indicator exists
   - When unsure about indicators, prioritize this fallback rule

2. **Spread Notation Examples:**
   - "Cowboys -3.5 vs Eagles" → HOME=DAL, AWAY=PHI, spread_for_home=+3.5 (Cowboys favored at home)
   - "Patriots @ Chiefs -6" → HOME=KC, AWAY=NE, spread_for_home=+6 (Chiefs favored at home)
   - "Ravens at Steelers +2.5" → HOME=PIT, AWAY=BAL, spread_for_home=+2.5 (Steelers favored at home)
   - "Packers -1.5 at Lions" → HOME=DET, AWAY=GB, spread_for_home=-1.5 (Packers favored on road)
   - "Cardinals vs Saints -7" → HOME=ARI, AWAY=NO, spread_for_home=-7 (Saints favored on road)
   - **MANDATORY FALLBACK CASES (no vs/@/at indicators - FOLLOW EXACTLY):**
   - "Cowboys -3.5 Eagles" → LEFT=Cowboys=AWAY=DAL, RIGHT=Eagles=HOME=PHI, spread_for_home=-3.5
   - "Patriots Chiefs -6" → LEFT=Patriots=AWAY=NE, RIGHT=Chiefs=HOME=KC, spread_for_home=+6
   - "Ravens +2.5 Steelers" → LEFT=Ravens=AWAY=BAL, RIGHT=Steelers=HOME=PIT, spread_for_home=+2.5
   - "Packers Lions -4" → LEFT=Packers=AWAY=GB, RIGHT=Lions=HOME=DET, spread_for_home=+4
   - **TWO-SPREAD FORMAT (both teams show spreads):**
   - "Cowboys +6.5 Eagles -6.5" → AWAY=DAL, HOME=PHI, use HOME spread=-6.5
   - "Chiefs +2.5 Chargers +2.5" → AWAY=KC, HOME=LAC, spread_for_home=+2.5 (use right/home spread)
   - "Raiders +3.5 Patriots -3.5" → AWAY=LVR, HOME=NE, use HOME spread=-3.5

3. **Spread Direction:**
   - spread_for_home is POSITIVE if HOME team is favored
   - spread_for_home is NEGATIVE if AWAY team is favored
   - The team with the minus (-) sign is the favorite
   - Convert all spreads to home team perspective

4. **Edge Cases:**
   - is_pickem=true if |spread| < 0.5 or marked as "PICK" or "PK"
   - If notation is ambiguous, add issue and make best guess
   - Never create fictional matchups - only extract real games mentioned`
  }

  private getUserPrompt(rawText: string, season: number, week: number): string {
    return `Normalize this table of NFL games into the schema below.
RAW_TEXT_FROM_OCR_OR_CSV:
<<<
${rawText}
>>>
JSON_SCHEMA:
{
  "type":"object",
  "properties":{
    "rows":{
      "type":"array",
      "items":{
        "type":"object",
        "properties":{
          "season":{"type":"integer"},
          "week":{"type":"integer"},
          "kickoff_et":{"type":"string"},
          "home_team":{"type":"string"},
          "away_team":{"type":"string"},
          "fav_team_abbr":{"type":"string","nullable":true},
          "spread_for_home":{"type":"number","nullable":true},
          "total":{"type":"number","nullable":true},
          "moneyline_home":{"type":"integer","nullable":true},
          "moneyline_away":{"type":"integer","nullable":true},
          "is_pickem":{"type":"boolean"},
          "source_label":{"type":"string","nullable":true},
          "issues":{"type":"array","items":{"type":"string"}}
        },
        "required":[
          "season","week","kickoff_et","home_team","away_team",
          "fav_team_abbr","spread_for_home","total",
          "moneyline_home","moneyline_away","is_pickem","source_label","issues"
        ]
      }
    }
  },
  "required":["rows"]
}
ADDITIONAL CONTEXT:
- Season: ${season}
- Week: ${week}
Return ONLY the JSON object.`
  }

  private getSpreadUserPrompt(rawText: string): string {
    return `Extract ONLY the team matchups and spreads from this betting data.
RAW_TEXT_FROM_OCR_OR_CSV:
<<<
${rawText}
>>>
JSON_SCHEMA:
{
  "type": "object",
  "properties": {
    "spreads": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "home_team": {"type": "string"},
          "away_team": {"type": "string"},
          "spread_for_home": {"type": "number", "nullable": true},
          "is_pickem": {"type": "boolean"},
          "issues": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["home_team", "away_team", "spread_for_home", "is_pickem", "issues"]
      }
    }
  },
  "required": ["spreads"]
}
Return ONLY the JSON object with team matchups and spreads.`
  }

  async normalizeText(
    rawText: string,
    season: number,
    week: number
  ): Promise<NormalizationResult> {
    if (this.config.provider === 'disabled') {
      return {
        rows: [],
        success: false,
        error: 'LLM normalization is disabled',
      }
    }

    try {
      const systemPrompt = this.getSystemPrompt()
      const userPrompt = this.getUserPrompt(rawText, season, week)

      let result: NormalizationResult

      if (this.config.provider === 'openai' && this.openai) {
        result = await this.normalizeWithOpenAI(systemPrompt, userPrompt)
      } else if (this.config.provider === 'anthropic' && this.anthropic) {
        result = await this.normalizeWithAnthropic(systemPrompt, userPrompt)
      } else if (this.config.provider === 'deepseek' && this.deepseek) {
        result = await this.normalizeWithDeepSeek(systemPrompt, userPrompt)
      } else {
        throw new Error(
          `Provider ${this.config.provider} not properly configured`
        )
      }

      return result
    } catch (error) {
      return {
        rows: [],
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown normalization error',
        provider: this.config.provider,
      }
    }
  }

  async normalizeSpreads(rawText: string): Promise<SpreadNormalizationResult> {
    if (this.config.provider === 'disabled') {
      return {
        spreads: [],
        success: false,
        error: 'LLM normalization is disabled',
      }
    }

    try {
      const systemPrompt = this.getSpreadSystemPrompt()
      const userPrompt = this.getSpreadUserPrompt(rawText)

      let result: SpreadNormalizationResult

      if (this.config.provider === 'openai' && this.openai) {
        result = await this.normalizeSpreadsWithOpenAI(systemPrompt, userPrompt)
      } else if (this.config.provider === 'anthropic' && this.anthropic) {
        result = await this.normalizeSpreadsWithAnthropic(
          systemPrompt,
          userPrompt
        )
      } else if (this.config.provider === 'deepseek' && this.deepseek) {
        result = await this.normalizeSpreadsWithDeepSeek(
          systemPrompt,
          userPrompt
        )
      } else {
        throw new Error(
          `Provider ${this.config.provider} not properly configured`
        )
      }

      return result
    } catch (error) {
      return {
        spreads: [],
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown normalization error',
        provider: this.config.provider,
      }
    }
  }

  private async normalizeWithOpenAI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<NormalizationResult> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized')
    }

    console.log('[LLM] Making OpenAI API call with model:', this.config.model)

    // GPT-5 uses reasoning tokens, so we need more total tokens
    const maxTokens =
      this.config.model === 'gpt-5'
        ? (this.config.maxTokens || 2000) + 3000 // Add 3000 for reasoning
        : this.config.maxTokens || 2000

    console.log('[LLM] Using max_completion_tokens:', maxTokens)

    const response = await this.openai.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: maxTokens,
      // Only set temperature for non-gpt-5 models
      ...(this.config.model !== 'gpt-5' && { temperature: 0.1 }),
      response_format: { type: 'json_object' },
    })

    console.log('[LLM] OpenAI response received:', {
      choices: response.choices?.length,
      firstChoice: response.choices?.[0]?.message?.content?.substring(0, 100),
      usage: response.usage,
      model: response.model,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.log(
        '[LLM] Full OpenAI response:',
        JSON.stringify(response, null, 2)
      )
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)
    const tokensUsed = response.usage?.total_tokens || 0
    const costUSD = this.estimateOpenAICost(
      tokensUsed,
      this.config.model || 'gpt-4o-mini'
    )

    return {
      rows: parsed.rows || [],
      success: true,
      provider: 'openai',
      tokensUsed,
      costUSD,
    }
  }

  private async normalizeWithAnthropic(
    systemPrompt: string,
    userPrompt: string
  ): Promise<NormalizationResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized')
    }

    const response = await this.anthropic.messages.create({
      model: this.config.model || 'claude-3-haiku-20240307',
      max_tokens: this.config.maxTokens || 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Anthropic')
    }

    const parsed = JSON.parse(content.text)
    const tokensUsed =
      response.usage.input_tokens + response.usage.output_tokens
    const costUSD = this.estimateAnthropicCost(
      response.usage.input_tokens,
      response.usage.output_tokens,
      this.config.model || 'claude-3-haiku-20240307'
    )

    return {
      rows: parsed.rows || [],
      success: true,
      provider: 'anthropic',
      tokensUsed,
      costUSD,
    }
  }

  private async normalizeWithDeepSeek(
    systemPrompt: string,
    userPrompt: string
  ): Promise<NormalizationResult> {
    if (!this.deepseek) {
      throw new Error('DeepSeek not initialized')
    }

    console.log('[LLM] Making DeepSeek API call with model:', this.config.model)

    const response = await this.deepseek.chat.completions.create({
      model: this.config.model || 'deepseek-v3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: this.config.maxTokens || 2000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    console.log('[LLM] DeepSeek response received:', {
      choices: response.choices?.length,
      firstChoice: response.choices?.[0]?.message?.content?.substring(0, 100),
      usage: response.usage,
      model: response.model,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.log(
        '[LLM] Full DeepSeek response:',
        JSON.stringify(response, null, 2)
      )
      throw new Error('No response from DeepSeek')
    }

    const parsed = JSON.parse(content)
    const tokensUsed = response.usage?.total_tokens || 0
    const costUSD = this.estimateDeepSeekCost(
      tokensUsed,
      this.config.model || 'deepseek-v3'
    )

    console.log('[LLM] DeepSeek parsed rows (first 3):')
    if (parsed.rows && parsed.rows.length > 0) {
      console.log(JSON.stringify(parsed.rows.slice(0, 3), null, 2))
    }

    return {
      rows: parsed.rows || [],
      success: true,
      provider: 'deepseek',
      tokensUsed,
      costUSD,
    }
  }

  private async normalizeSpreadsWithOpenAI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<SpreadNormalizationResult> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized')
    }

    console.log(
      '[LLM] Making OpenAI API call for spread extraction with model:',
      this.config.model
    )

    const maxTokens =
      this.config.model === 'gpt-5'
        ? (this.config.maxTokens || 1000) + 1500 // Add reasoning tokens for GPT-5
        : this.config.maxTokens || 1000

    const response = await this.openai.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: maxTokens,
      ...(this.config.model !== 'gpt-5' && { temperature: 0.1 }),
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    console.log('[LLM] OpenAI raw response content:', content.substring(0, 500) + (content.length > 500 ? '...' : ''))
    const parsed = JSON.parse(content)
    console.log('[LLM] OpenAI parsed spreads:', parsed.spreads?.length || 0)
    console.log('[LLM] OpenAI full parsed object keys:', Object.keys(parsed))
    const tokensUsed = response.usage?.total_tokens || 0
    const costUSD = this.estimateOpenAICost(
      tokensUsed,
      this.config.model || 'gpt-4o-mini'
    )

    return {
      spreads: parsed.spreads || [],
      success: true,
      provider: 'openai',
      tokensUsed,
      costUSD,
    }
  }

  private async normalizeSpreadsWithAnthropic(
    systemPrompt: string,
    userPrompt: string
  ): Promise<SpreadNormalizationResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized')
    }

    const response = await this.anthropic.messages.create({
      model: this.config.model || 'claude-3-haiku-20240307',
      max_tokens: this.config.maxTokens || 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Anthropic')
    }

    const parsed = JSON.parse(content.text)
    const tokensUsed =
      response.usage.input_tokens + response.usage.output_tokens
    const costUSD = this.estimateAnthropicCost(
      response.usage.input_tokens,
      response.usage.output_tokens,
      this.config.model || 'claude-3-haiku-20240307'
    )

    return {
      spreads: parsed.spreads || [],
      success: true,
      provider: 'anthropic',
      tokensUsed,
      costUSD,
    }
  }

  private async normalizeSpreadsWithDeepSeek(
    systemPrompt: string,
    userPrompt: string
  ): Promise<SpreadNormalizationResult> {
    if (!this.deepseek) {
      throw new Error('DeepSeek not initialized')
    }

    console.log(
      '[LLM] Making DeepSeek API call for spread extraction with model:',
      this.config.model
    )

    const response = await this.deepseek.chat.completions.create({
      model: this.config.model || 'deepseek-v3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: this.config.maxTokens || 1000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from DeepSeek')
    }

    const parsed = JSON.parse(content)
    const tokensUsed = response.usage?.total_tokens || 0
    const costUSD = this.estimateDeepSeekCost(
      tokensUsed,
      this.config.model || 'deepseek-v3'
    )

    console.log('[LLM] DeepSeek spread extraction completed:', {
      spreadsFound: parsed.spreads?.length || 0,
      tokensUsed,
      costUSD,
    })

    return {
      spreads: parsed.spreads || [],
      success: true,
      provider: 'deepseek',
      tokensUsed,
      costUSD,
    }
  }

  private estimateOpenAICost(tokens: number, model: string): number {
    const rates: Record<string, { input: number; output: number }> = {
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
    }

    const rate = rates[model] || rates['gpt-4o-mini']
    // Rough estimate assuming 70% input, 30% output
    return (tokens * 0.7 * rate.input + tokens * 0.3 * rate.output) / 1000
  }

  private estimateAnthropicCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    const rates: Record<string, { input: number; output: number }> = {
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    }

    const rate = rates[model] || rates['claude-3-haiku-20240307']
    return (inputTokens * rate.input + outputTokens * rate.output) / 1000
  }

  private estimateDeepSeekCost(tokens: number, model: string): number {
    const rates: Record<string, { input: number; output: number }> = {
      'deepseek-v3': { input: 0.00027, output: 0.0011 }, // $0.27/$1.10 per 1M tokens
      'deepseek-coder': { input: 0.00014, output: 0.00028 }, // $0.14/$0.28 per 1M tokens
      'deepseek-chat': { input: 0.00014, output: 0.00028 }, // $0.14/$0.28 per 1M tokens
    }

    const rate = rates[model] || rates['deepseek-v3']
    // Rough estimate assuming 70% input, 30% output
    return (tokens * 0.7 * rate.input + tokens * 0.3 * rate.output) / 1000
  }
}

// Factory function to create service from environment variables
export function createLLMNormalizerService(): LLMNormalizerService {
  const provider =
    (process.env.LLM_NORMALIZER_PROVIDER as LLMProvider) || 'disabled'

  return new LLMNormalizerService({
    provider,
    apiKey:
      provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : provider === 'anthropic'
          ? process.env.ANTHROPIC_API_KEY
          : provider === 'deepseek'
            ? process.env.DEEPSEEK_API_KEY
            : undefined,
    model:
      provider === 'openai'
        ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
        : provider === 'anthropic'
          ? process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
          : provider === 'deepseek'
            ? process.env.DEEPSEEK_MODEL || 'deepseek-v3'
            : undefined,
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '30000'),
    costCapUSD: parseFloat(process.env.LLM_COST_CAP_USD || '1.0'),
  })
}
