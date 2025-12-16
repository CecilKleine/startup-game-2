export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatRunway(months: number): string {
  if (months < 0) return '0 days';
  if (months === Infinity) return '∞';
  
  // Convert fractional months to total days (assuming 30 days per month)
  const totalDays = Math.floor(months * 30);
  
  const years = Math.floor(totalDays / 360);
  const remainingDaysAfterYears = totalDays % 360;
  const monthsRemaining = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;
  
  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years}${years === 1 ? ' year' : ' years'}`);
  }
  if (monthsRemaining > 0) {
    parts.push(`${monthsRemaining}${monthsRemaining === 1 ? ' month' : ' months'}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days}${days === 1 ? ' day' : ' days'}`);
  }
  
  return parts.join(', ');
}

export function formatDate(startDateISO: string, daysElapsed: number): string {
  const startDate = new Date(startDateISO);
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + Math.floor(daysElapsed));
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return currentDate.toLocaleDateString('en-US', options);
}

/**
 * Format funding round type for display
 * Converts 'seriesA' -> 'Series A', 'seed' -> 'Seed', etc.
 */
export function formatFundingRoundType(roundType: string): string {
  if (roundType === 'seed') {
    return 'Seed';
  }
  if (roundType.startsWith('series')) {
    const series = roundType.replace('series', '');
    return `Series ${series.toUpperCase()}`;
  }
  return roundType.charAt(0).toUpperCase() + roundType.slice(1);
}
