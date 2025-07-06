
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Search,
  Smartphone,
  Shield
} from 'lucide-react';

interface SEOAnalysisResultsProps {
  data: any;
}

export const SEOAnalysisResults: React.FC<SEOAnalysisResultsProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const calculateOverallScore = () => {
    let score = 100;
    
    // Deduct points for issues
    if (!data.title) score -= 15;
    else if (data.title_length > 60 || data.title_length < 30) score -= 5;
    
    if (!data.meta_description) score -= 15;
    else if (data.meta_description_length > 160 || data.meta_description_length < 120) score -= 5;
    
    if (data.h1_count === 0) score -= 10;
    else if (data.h1_count > 1) score -= 5;
    
    if (!data.is_https) score -= 10;
    if (!data.has_viewport) score -= 5;
    if (!data.lang_in_html) score -= 5;
    if (data.images_without_alt > 0) score -= Math.min(10, data.images_without_alt * 2);
    if (data.load_time_ms > 3000) score -= 10;
    if (data.word_count < 300) score -= 5;
    
    return Math.max(0, score);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Score
            </span>
            <Badge variant={getScoreBadgeVariant(overallScore)} className="text-lg px-3 py-1">
              {overallScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-white">
            <div className="flex-1">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    overallScore >= 80 ? 'bg-green-400' : 
                    overallScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Needs Work' : 'Poor'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Issues and Warnings */}
      {(data.seo_issues || data.warnings) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.seo_issues && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                <strong>Critical Issues:</strong> {data.seo_issues}
              </AlertDescription>
            </Alert>
          )}
          
          {data.warnings && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                <strong>Warnings:</strong> {data.warnings}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main SEO Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Page Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Title Tag</label>
              <p className="text-white break-words">{data.title || 'Not found'}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={data.title && data.title_length >= 30 && data.title_length <= 60 ? 'default' : 'destructive'}>
                  {data.title_length} chars
                </Badge>
                {data.title_duplicate && <Badge variant="destructive">Duplicate</Badge>}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Meta Description</label>
              <p className="text-white break-words">{data.meta_description || 'Not found'}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={data.meta_description && data.meta_description_length >= 120 && data.meta_description_length <= 160 ? 'default' : 'destructive'}>
                  {data.meta_description_length} chars
                </Badge>
                {data.meta_desc_duplicate && <Badge variant="destructive">Duplicate</Badge>}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">H1 Tag</label>
              <p className="text-white break-words">{data.h1 || 'Not found'}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={data.h1_count === 1 ? 'default' : 'destructive'}>
                  {data.h1_count} H1 tags
                </Badge>
                {data.h1_duplicate && <Badge variant="destructive">Duplicate</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Technical SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={data.is_https ? 'default' : 'destructive'}>
                  {data.is_https ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                </Badge>
                <span className="text-white text-sm">HTTPS</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={data.has_viewport ? 'default' : 'destructive'}>
                  {data.has_viewport ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                </Badge>
                <span className="text-white text-sm">Mobile Viewport</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={data.lang_in_html ? 'default' : 'destructive'}>
                  {data.lang_in_html ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                </Badge>
                <span className="text-white text-sm">Lang Attribute</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={data.canonical_url ? 'default' : 'secondary'}>
                  {data.canonical_url ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                </Badge>
                <span className="text-white text-sm">Canonical URL</span>
              </div>
            </div>
            
            {data.canonical_url && (
              <div>
                <label className="text-sm text-gray-400">Canonical URL</label>
                <p className="text-white break-all text-sm">{data.canonical_url}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance and Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.load_time_ms}ms</p>
                <p className="text-sm text-gray-400">Load Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.word_count}</p>
                <p className="text-sm text-gray-400">Words</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.total_images}</p>
                <p className="text-sm text-gray-400">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.total_links}</p>
                <p className="text-sm text-gray-400">Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Images Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Total Images:</span>
              <span>{data.total_images}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Missing Alt Text:</span>
              <span className={data.images_without_alt > 0 ? 'text-red-400' : 'text-green-400'}>
                {data.images_without_alt}
              </span>
            </div>
            <div className="flex justify-between text-white">
              <span>Empty Alt Text:</span>
              <span className={data.images_with_empty_alt > 0 ? 'text-yellow-400' : 'text-green-400'}>
                {data.images_with_empty_alt}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Links Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Internal Links:</span>
              <span>{data.internal_links}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>External Links:</span>
              <span>{data.external_links}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Links without Text:</span>
              <span className={data.links_without_text > 0 ? 'text-red-400' : 'text-green-400'}>
                {data.links_without_text}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media and Schema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Media Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={data.og_title ? 'default' : 'destructive'}>
                {data.og_title ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              </Badge>
              <span className="text-white text-sm">Open Graph Title</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.og_description ? 'default' : 'destructive'}>
                {data.og_description ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              </Badge>
              <span className="text-white text-sm">Open Graph Description</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.og_image ? 'default' : 'destructive'}>
                {data.og_image ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              </Badge>
              <span className="text-white text-sm">Open Graph Image</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.twitter_card ? 'default' : 'destructive'}>
                {data.twitter_card ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              </Badge>
              <span className="text-white text-sm">Twitter Card</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-white">
              <span>H2 Tags:</span>
              <span>{data.h2_count}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>H3 Tags:</span>
              <span>{data.h3_count}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Paragraphs:</span>
              <span>{data.paragraph_count}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Lists:</span>
              <span>{data.list_count}</span>
            </div>
            {data.schema_types && (
              <div>
                <label className="text-sm text-gray-400">Schema Types:</label>
                <p className="text-white text-sm">{data.schema_types}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
