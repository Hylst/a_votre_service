/**
 * Test page for SEOAnalyzer component
 * Used to isolate and debug the SEO tool functionality
 */
import React from 'react';
import { SEOAnalyzer } from './components/tools/textUtils/SEOAnalyzer';

const TestSEO = () => {
  const [data, setData] = React.useState({});

  const handleDataChange = (newData: any) => {
    console.log('SEO Data changed:', newData);
    setData(newData);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test SEO Analyzer</h1>
      <SEOAnalyzer 
        data={data} 
        onDataChange={handleDataChange} 
      />
    </div>
  );
};

export default TestSEO;