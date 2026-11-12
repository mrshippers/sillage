import type { CapacitorConfig } from '@capacitor/cli'

// The App Store build. The bundle id is provisional until the App Store Connect record exists.
const config: CapacitorConfig = {
  appId: 'studio.shippers.sillage',
  appName: 'Sillage',
  webDir: 'dist',
  backgroundColor: '#070507',
  ios: { contentInset: 'never', backgroundColor: '#070507' },
}

export default config
