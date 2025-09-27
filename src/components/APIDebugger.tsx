import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const APIDebugger: React.FC = () => {
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testAPIEndpoint = async (url: string, name: string) => {
    try {
      console.log(`🧪 Testing ${name}: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');
      
      let data;
      let error = null;
      
      try {
        if (isJSON) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { rawResponse: text.substring(0, 200) + '...' };
          error = `Expected JSON but got ${contentType}`;
        }
      } catch (parseError) {
        const text = await response.text();
        data = { rawResponse: text.substring(0, 200) + '...' };
        error = `JSON parse error: ${parseError}`;
      }

      const result = {
        name,
        url,
        status: response.status,
        statusText: response.statusText,
        contentType,
        isJSON,
        data,
        error,
        timestamp: new Date().toISOString()
      };

      setDebugResults(prev => [result, ...prev]);
      console.log(`✅ ${name} result:`, result);
      
    } catch (err) {
      const result = {
        name,
        url,
        status: 'ERROR',
        statusText: 'Network Error',
        contentType: null,
        isJSON: false,
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      setDebugResults(prev => [result, ...prev]);
      console.error(`❌ ${name} error:`, err);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setDebugResults([]);
    
    const tests = [
      { url: 'http://localhost:5000/health', name: 'Health Check' },
      { url: 'http://localhost:5000/debug', name: 'Debug Endpoint' },
      { url: 'http://localhost:5000/api/data/trainsets', name: 'Trainsets API' },
      { url: 'http://localhost:5000/api/data/metrics', name: 'Metrics API' },
      { url: 'http://localhost:8001/api/health', name: 'OR-Tools Health' },
    ];

    for (const test of tests) {
      await testAPIEndpoint(test.url, test.name);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔧 API Debugger</span>
          <div className="space-x-2">
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run All Tests'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debugResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.status === 200 ? 'bg-green-100 text-green-800' :
                    result.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.isJSON ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isJSON ? 'JSON' : 'Not JSON'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <div><strong>URL:</strong> {result.url}</div>
                <div><strong>Content-Type:</strong> {result.contentType || 'N/A'}</div>
                <div><strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</div>
              </div>
              
              {result.error && (
                <Alert className="mb-2">
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {result.error}
                  </AlertDescription>
                </Alert>
              )}
              
              {result.data && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <strong>Response:</strong>
                  <pre className="mt-1 overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
          
          {debugResults.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Click "Run All Tests" to start debugging API endpoints
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default APIDebugger;
