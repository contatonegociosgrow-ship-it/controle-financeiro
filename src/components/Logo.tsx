import Image from 'next/image';

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
  useImgTag?: boolean; // Para casos onde não podemos usar Next Image
  imgClassName?: string; // Para quando usar img tag
};

/**
 * Componente reutilizável para o logo da aplicação
 */
export function Logo({
  width = 80,
  height = 80,
  className = '',
  alt = 'Meu Salário em dia',
  priority = false,
  useImgTag = false,
  imgClassName = '',
}: LogoProps) {
  if (useImgTag) {
    return (
      <img
        src="/logo.png"
        alt={alt}
        className={imgClassName || className}
        width={width}
        height={height}
      />
    );
  }

  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
