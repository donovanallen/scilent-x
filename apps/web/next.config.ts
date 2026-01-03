import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configure pageExtensions to include mdx
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  devIndicators: false,
};

const withMDX = createMDX({
  // Add MDX plugins here if needed
  options: {},
});

export default withMDX(nextConfig);
