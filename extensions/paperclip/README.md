# Paperclip AI Provider Plugin

This plugin adds support for Paperclip AI as a model provider in OpenClaw.

## Overview

Paperclip AI is hosted on Render and provides AI model inference capabilities. This plugin allows OpenClaw agents to use Paperclip AI models for text generation and other AI tasks.

## Configuration

### Environment Variables

- `PAPERCLIP_API_KEY`: Your Paperclip AI API key

### Setup

1. Obtain an API key from your Paperclip AI instance
2. Set the environment variable: `export PAPERCLIP_API_KEY=your-api-key`
3. Configure OpenClaw to use the Paperclip provider

### OpenClaw Configuration

Add to your OpenClaw config:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "paperclip/gpt-4"
      }
    }
  }
}
```

## API Compatibility

This plugin currently assumes OpenAI-compatible API endpoints. If your Paperclip AI uses a different API format, the provider implementation can be modified accordingly.

## Development

### Testing

Run the extension tests:

```bash
pnpm test:extension paperclip
```

### Building

The plugin is built as part of the main OpenClaw build process.

## Contributing

When modifying this plugin:

1. Follow OpenClaw's plugin development guidelines
2. Update tests for any new functionality
3. Ensure compatibility with the plugin SDK
4. Test against the target Paperclip AI API

## License

This plugin is part of the OpenClaw project and follows the same license terms.
