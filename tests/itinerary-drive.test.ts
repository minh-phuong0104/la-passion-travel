import { describe, expect, it } from 'vitest';
import { parseDrivePdfId } from '@/lib/itineraries/drive';

describe('Google Drive itinerary links', () => {
  const fileId = '1R-8f-2BidEUF5JZ9NBtQcQ9spfeEvOAV';

  it('accepts an individual Drive file or download link', () => {
    expect(parseDrivePdfId(`https://drive.google.com/file/d/${fileId}/view?usp=sharing`)).toBe(fileId);
    expect(parseDrivePdfId(`https://drive.google.com/uc?export=download&id=${fileId}`)).toBe(fileId);
  });

  it('rejects shared folders and unrelated hosts', () => {
    expect(parseDrivePdfId(`https://drive.google.com/drive/folders/${fileId}`)).toBeNull();
    expect(parseDrivePdfId(`https://example.com/file/d/${fileId}/view`)).toBeNull();
  });
});
