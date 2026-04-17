import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 text-center">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              حدث خطأ غير متوقع
            </h1>
            <p className="text-gray-600 mb-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
              عذراً، حدث خطأ ما أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو العودة للرئيسية.
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
