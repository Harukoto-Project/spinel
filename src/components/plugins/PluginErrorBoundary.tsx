import { Component, type ErrorInfo, type ReactNode } from 'react';
import { describeError } from '@/lib/errors';

type PluginErrorBoundaryProps = {
  pluginName: string;
  children: ReactNode;
};

type PluginErrorBoundaryState = {
  error: unknown;
};

export class PluginErrorBoundary extends Component<PluginErrorBoundaryProps, PluginErrorBoundaryState> {
  state: PluginErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): PluginErrorBoundaryState {
    return { error: error ?? new Error('不明なエラー') };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[plugin:${this.props.pluginName}] ページの描画に失敗しました`, error, info.componentStack);
  }

  render() {
    if (this.state.error === null) return this.props.children;

    return (
      <div role="alert" className="flex flex-col gap-2 border-l-2 border-destructive pl-4 text-sm">
        <p className="font-medium text-destructive">{this.props.pluginName} のページを表示できませんでした</p>
        <p className="break-words text-muted-foreground">{describeError(this.state.error)}</p>
      </div>
    );
  }
}
