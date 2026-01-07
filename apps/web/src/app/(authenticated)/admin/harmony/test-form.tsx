// apps/web/src/app/(authenticated)/(admin)/harmonization/test-form.tsx
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from '@scilent-one/ui';
import { useState } from 'react';

import { lookupByGtin, lookupByIsrc, searchReleases } from '../actions';

export function HarmonizationTestForm() {
  const [gtin, setGtin] = useState('');
  const [isrc, setIsrc] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleGtinLookup = async () => {
    setLoading(true);
    const res = await lookupByGtin(gtin);
    setResult(res);
    setLoading(false);
  };

  const handleIsrcLookup = async () => {
    setLoading(true);
    const res = await lookupByIsrc(isrc);
    setResult(res);
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const res = await searchReleases(query);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>GTIN/UPC Lookup</CardTitle>
        </CardHeader>
        <CardContent className='flex gap-4'>
          <Input
            placeholder='e.g., 0602445790920'
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
          />
          <Button onClick={handleGtinLookup} disabled={loading}>
            Lookup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ISRC Lookup</CardTitle>
        </CardHeader>
        <CardContent className='flex gap-4'>
          <Input
            placeholder='e.g., USRC17607839'
            value={isrc}
            onChange={(e) => setIsrc(e.target.value)}
          />
          <Button onClick={handleIsrcLookup} disabled={loading}>
            Lookup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Releases</CardTitle>
        </CardHeader>
        <CardContent className='flex gap-4'>
          <Input
            placeholder='e.g., Abbey Road Beatles'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </CardContent>
      </Card>

      {result !== null && result !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='bg-muted p-4 rounded-md overflow-auto text-sm max-h-96'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
