import { FC } from 'react';
import Image from 'next/image';

interface ProviderIconProps {
  model: string;
  className?: string;
}

const ProviderIcon: FC<ProviderIconProps> = ({ model, className = "w-4 h-4" }) => {
  // Helper function to determine provider and domain from model string
  const getProviderInfo = (model: string): { provider: string; domain: string } => {
    const [provider] = model.split('/');
    const providerLower = provider.toLowerCase();
    
    const domainMap: { [key: string]: string } = {
      'openai': 'chatgpt.com',
      'anthropic': 'claude.ai',
      'google': 'gemini.google.com',
      // Add more providers as needed
    };

    return {
      provider: providerLower,
      domain: domainMap[providerLower] || ''
    };
  };

  const { domain } = getProviderInfo(model);
  
  if (!domain) return null;

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  // Extract width and height from className if provided
  const sizeMatch = className?.match(/w-(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16; // Multiply by 4 since Tailwind uses 0.25rem units

  return (
    <Image
      src={faviconUrl}
      alt="Provider Icon"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default ProviderIcon; 