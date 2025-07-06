
export class SEOService {
  async analyzePage(url: string) {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      
      // Attempt to get some real data where possible
      const realAnalysis = await this.attemptRealAnalysis(url);
      
      return realAnalysis;
    } catch (error) {
      throw new Error('Invalid URL or analysis failed: ' + error);
    }
  }

  private async attemptRealAnalysis(url: string): Promise<any> {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    
    let canFetchContent = false;
    let actualContent = null;
    let loadTime = 0;
    let responseSize = 0;
    let statusCode = 'CORS_BLOCKED';

    // Try to fetch the URL (will likely fail due to CORS)
    try {
      const response = await fetch(url, { 
        mode: 'no-cors',
        method: 'GET'
      });
      loadTime = Date.now() - startTime;
      // With no-cors, we can't read the response but we can check if request succeeded
      statusCode = response.type === 'opaque' ? 'CORS_BLOCKED' : response.status;
    } catch (error) {
      loadTime = Date.now() - startTime;
      statusCode = 'FETCH_ERROR';
    }

    // For sitemap analysis, try to fetch it if it's from the same domain
    let sitemapData = null;
    const possibleSitemaps = [
      `${parsedUrl.protocol}//${parsedUrl.host}/sitemap.xml`,
      `${parsedUrl.protocol}//${parsedUrl.host}/sitemap_index.xml`,
      `${parsedUrl.protocol}//${parsedUrl.host}/page-sitemap.xml`
    ];

    for (const sitemapUrl of possibleSitemaps) {
      try {
        const sitemapResponse = await fetch(sitemapUrl, { mode: 'no-cors' });
        if (sitemapResponse.type === 'opaque') {
          sitemapData = { found: true, url: sitemapUrl };
          break;
        }
      } catch (error) {
        // Continue to next sitemap
      }
    }

    // Generate analysis based on what we can determine
    const analysis = {
      original_url: url,
      final_url: url,
      status_code: statusCode,
      load_time_ms: loadTime,
      response_size_kb: responseSize,
      content_type: 'Unable to determine (CORS)',
      
      // Redirects - can't determine due to CORS
      has_redirects: false,
      redirect_count: 0,
      redirect_type: 'Unable to determine (CORS)',
      
      // Basic SEO elements - can't access due to CORS
      title: 'Unable to access (CORS restriction)',
      title_length: 0,
      meta_description: 'Unable to access (CORS restriction)',
      meta_description_length: 0,
      meta_keywords: 'Unable to access (CORS restriction)',
      h1: 'Unable to access (CORS restriction)',
      h1_length: 0,
      h1_count: 0,
      h2_count: 0,
      h3_count: 0,
      h4_count: 0,
      h5_count: 0,
      h6_count: 0,
      
      // Duplicate content flags
      title_equals_h1: false,
      title_duplicate: false,
      h1_duplicate: false,
      meta_desc_duplicate: false,
      
      // Language and localization
      lang_attribute: 'Unable to determine (CORS)',
      lang_in_html: false,
      hreflang_present: false,
      hreflang_count: 0,
      
      // Technical SEO - what we can determine
      canonical_url: 'Unable to access (CORS restriction)',
      canonical_self_referencing: false,
      robots_meta: 'Unable to access (CORS restriction)',
      robots_noindex: false,
      robots_nofollow: false,
      is_https: isHttps,
      has_viewport: false,
      viewport_content: 'Unable to access (CORS restriction)',
      has_favicon: false,
      has_amp: false,
      amp_url: '',
      
      // Content analysis
      word_count: 0,
      sentence_count: 0,
      paragraph_count: 0,
      list_count: 0,
      table_count: 0,
      flesch_reading_ease: 0,
      avg_words_per_sentence: 0,
      
      // Link analysis
      internal_links: 0,
      external_links: 0,
      total_links: 0,
      links_without_text: 0,
      
      // Image analysis
      total_images: 0,
      images_without_alt: 0,
      images_with_empty_alt: 0,
      images_over_100kb: 0,
      
      // Social media
      og_title: 'Unable to access (CORS restriction)',
      og_description: 'Unable to access (CORS restriction)',
      og_image: 'Unable to access (CORS restriction)',
      twitter_title: 'Unable to access (CORS restriction)',
      twitter_description: 'Unable to access (CORS restriction)',
      twitter_card: 'Unable to access (CORS restriction)',
      social_tags_complete: false,
      missing_social_tags: 'Unable to determine due to CORS restrictions',
      
      // Dates
      date_published: 'Unable to access (CORS restriction)',
      date_modified: 'Unable to access (CORS restriction)',
      date_source: 'Unable to access (CORS restriction)',
      
      // Schema.org
      schema_types: 'Unable to access (CORS restriction)',
      has_structured_data: false,
      
      crawl_timestamp: new Date().toISOString()
    };

    // Generate realistic issues based on what we can determine
    const issues = [];
    const warnings = [];

    // Technical issues we can identify
    if (!isHttps) {
      issues.push('Website is not using HTTPS - this is a major SEO issue');
    }

    // CORS-related limitations
    warnings.push('Full SEO analysis blocked by CORS policy - content analysis unavailable');
    warnings.push('To perform complete SEO audit, a backend API or browser extension would be required');
    
    if (sitemapData) {
      warnings.push(`Sitemap potentially found at: ${sitemapData.url}`);
    } else {
      issues.push('No accessible sitemap found at common locations');
    }

    // URL structure analysis (we can do this)
    if (url.length > 100) {
      warnings.push(`URL is quite long (${url.length} characters) - consider shortening`);
    }
    
    if (parsedUrl.pathname.includes('_')) {
      warnings.push('URL contains underscores - hyphens are preferred for SEO');
    }
    
    if (parsedUrl.search) {
      warnings.push('URL contains query parameters - ensure they are necessary');
    }

    // Domain analysis
    const domainParts = parsedUrl.hostname.split('.');
    if (domainParts.length > 3) {
      warnings.push('Domain has multiple subdomains - ensure this is intentional');
    }

    analysis.seo_issues = issues.join('; ');
    analysis.warnings = warnings.join('; ');

    return analysis;
  }
}
