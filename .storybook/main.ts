import type { StorybookConfig } from '@storybook/react-vite';

function pluginName(plugin: unknown): string {
  if (Array.isArray(plugin)) return plugin.map(pluginName).join(' ');
  if (plugin && typeof plugin === 'object' && 'name' in plugin) {
    return String(plugin.name);
  }
  return '';
}

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    // Storybook renders client components in isolation. The repository Vite
    // config also installs the Vinext RSC and Cloudflare deployment pipeline;
    // those plugins expect a server manifest and cannot run in this preview.
    plugins: viteConfig.plugins?.filter((plugin) => {
      return !/rsc|vinext|cloudflare|openai.*sites/i.test(pluginName(plugin));
    }),
  }),
};
export default config;
