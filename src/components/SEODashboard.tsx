
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Search, Globe, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { SEOAnalysisResults } from '@/components/SEOAnalysisResults';
import { SEOService } from '@/services/seoService';

const SEODashboard: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const seoService = new SEOService();
      const analysisResults = await seoService.analyzePage(url);
      setResults(analysisResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Globe className="text-cyan-400" />
            SEO Audit Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive SEO analysis tool for optimizing your website's search engine performance
          </p>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter URL to Analyze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  disabled={isAnalyzing}
                />
              </div>
              <RainbowButton
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="min-w-[120px]"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  'Analyze SEO'
                )}
              </RainbowButton>
            </div>
            
            {error && (
              <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && <SEOAnalysisResults data={results} />}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-white">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-lg">Analyzing your website's SEO...</span>
            </div>
            <p className="text-gray-400 mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Features Overview */}
        {!results && !isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Technical SEO</h3>
                </div>
                <p className="text-gray-300">
                  Analyze HTTPS, viewport, meta tags, canonical URLs, and more technical factors
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Performance</h3>
                </div>
                <p className="text-gray-300">
                  Check page load times, response sizes, and performance metrics
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Issue Detection</h3>
                </div>
                <p className="text-gray-300">
                  Automatically detect SEO issues and get actionable recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEODashboard;
