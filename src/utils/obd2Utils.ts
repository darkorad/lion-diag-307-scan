
export const parseHexResponse = (response: string): number[] => {
  // Remove spaces and convert hex pairs to numbers
  const cleanResponse = response.replace(/\s+/g, '').replace(/[^0-9A-Fa-f]/g, '');
  const bytes: number[] = [];
  
  for (let i = 0; i < cleanResponse.length; i += 2) {
    const hexByte = cleanResponse.substring(i, i + 2);
    if (hexByte.length === 2) {
      bytes.push(parseInt(hexByte, 16));
    }
  }
  
  return bytes;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
