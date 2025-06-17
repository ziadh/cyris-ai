import { FC } from "react";
import Image from "next/image";
import { AI_MODELS } from "@/lib/constants";

interface ProviderIconProps {
  model: string;
  className?: string;
}

const ProviderIcon: FC<ProviderIconProps> = ({
  model,
  className = "w-4 h-4",
}) => {
  // Helper function to determine provider and domain from model string
  const getProviderInfo = (
    model: string
  ): { provider: string; logoPath: string } => {
    const modelInfo = AI_MODELS.find(m => m.id === model);
    const provider = modelInfo?.id.split('/')[0].toLowerCase() || '';
    const logoPath = modelInfo?.logoPath || '';

    return {
      provider,
      logoPath,
    };
  };

  const { logoPath } = getProviderInfo(model);

  if (!logoPath) return null;


  // Extract width and height from className if provided
  const sizeMatch = className?.match(/w-(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16; // Multiply by 4 since Tailwind uses 0.25rem units

  return (
    <Image
      src={logoPath}
      alt="Provider Icon"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default ProviderIcon;
