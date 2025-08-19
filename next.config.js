/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src']
  },
  experimental: {
    typedRoutes: true
  },
  webpack: (config, { isServer }) => {
    // Fix for tesseract.js worker issues
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'tesseract.js': 'tesseract.js'
      })
    }
    
    // Copy tesseract.js worker files to public directory
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  }
}

export default nextConfig