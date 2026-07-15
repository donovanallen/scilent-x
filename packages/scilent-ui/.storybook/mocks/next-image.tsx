import * as React from 'react';

type StaticImport = { src: string };

type MockImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height'
> & {
  src: string | StaticImport;
  alt: string;
  fill?: boolean;
  width?: number | `${number}`;
  height?: number | `${number}`;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
};

/**
 * Storybook / Vite stand-in for `next/image` so artwork components render
 * without the Next.js runtime.
 */
export default function NextImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  style,
  onLoad,
  onError,
  sizes: _sizes,
  priority: _priority,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  ...rest
}: MockImageProps) {
  const resolved = typeof src === 'string' ? src : src.src;

  return (
    <img
      src={resolved}
      alt={alt}
      width={typeof width === 'number' ? width : undefined}
      height={typeof height === 'number' ? height : undefined}
      className={className}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...style,
            }
          : style
      }
      onLoad={onLoad}
      onError={onError}
      {...rest}
    />
  );
}
