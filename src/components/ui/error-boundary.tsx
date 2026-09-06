import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-8">
          <Card className="bg-[#0c0c0e] border-[#27272a] shadow-lg">
            <CardHeader className="pb-3 border-b border-[#1f1f23]">
              <div className="flex items-center space-x-2.5 text-[#ef4444]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <CardTitle className="text-sm font-semibold text-white">
                  {this.props.fallbackTitle || 'Component Rendering Error'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 font-mono text-xs">
              <p className="text-[#a1a1aa] leading-relaxed">
                An unexpected error occurred while rendering this section. Other application features remain operational.
              </p>
              {this.state.error && (
                <div className="p-3 rounded bg-[#000000] border border-[#27272a] text-[#ef4444] text-[11px] overflow-x-auto select-all">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={this.handleRetry}
                  className="h-8 text-xs font-medium px-3 bg-white text-black hover:bg-white/90"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
