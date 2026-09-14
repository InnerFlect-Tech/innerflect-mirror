import type { Meta, StoryObj } from '@storybook/react-vite';
import { SurfaceState } from './SurfaceState';

const meta = {
  component: SurfaceState,
  title: 'Cockpit/Surface state',
  args: { status: 'empty' },
} satisfies Meta<typeof SurfaceState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Loading: Story = { args: { status: 'loading' } };
export const Offline: Story = { args: { status: 'offline' } };
export const PermissionDenied: Story = {
  args: { status: 'permission-denied' },
};
export const Degraded3D: Story = { args: { status: 'degraded-3d' } };
