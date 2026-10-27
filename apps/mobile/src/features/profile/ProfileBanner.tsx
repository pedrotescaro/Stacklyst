import { useEffect, useState, type ReactNode } from 'react';
import { Image, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { config } from '../../lib/config';
import type { ProfilePreferences } from '../../lib/profile-customization';

export function ProfileBanner({
  banner,
  fallbackColor,
  legacyImage,
  height,
  children,
}: {
  banner?: ProfilePreferences['banner'];
  fallbackColor: string;
  legacyImage?: string | null;
  height: number;
  children?: ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const [measuredImage, setMeasuredImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const image =
    banner?.mode === 'image'
      ? banner.imageUrl
      : !banner || banner.mode === 'default'
        ? legacyImage
        : null;
  const uri = image?.startsWith('/') ? config.apiUrl + image : image;
  useEffect(() => {
    let active = true;
    if (uri)
      Image.getSize(
        uri,
        (imageWidth, imageHeight) => {
          if (active) setMeasuredImage({ uri, width: imageWidth, height: imageHeight });
        },
        () => {
          if (active) setFailed(uri);
        }
      );
    return () => {
      active = false;
    };
  }, [uri]);
  const imageSize = measuredImage?.uri === uri ? measuredImage : null;
  const scale =
    imageSize && width ? Math.max(width / imageSize.width, height / imageSize.height) : 1;
  const fittedWidth = imageSize ? imageSize.width * scale : width;
  const fittedHeight = imageSize ? imageSize.height * scale : height;
  const color = banner && /^#[\da-f]{6}$/i.test(banner.color) ? banner.color : fallbackColor;
  const secondary =
    banner && /^#[\da-f]{6}$/i.test(banner.secondaryColor) ? banner.secondaryColor : '#7C3AED';
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        width: '100%',
        height,
        borderRadius: 28,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: banner && banner.mode !== 'default' ? color : fallbackColor,
      }}
    >
      {banner?.mode === 'gradient' && (
        <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <Defs>
            <LinearGradient id="profile-banner" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} />
              <Stop offset="1" stopColor={secondary} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#profile-banner)" />
        </Svg>
      )}
      {!!uri && uri !== failed && (
        <Image
          accessibilityLabel="Banner do perfil"
          source={{ uri }}
          onError={() => setFailed(uri)}
          resizeMode="cover"
          style={{
            position: 'absolute',
            width: fittedWidth || '100%',
            height: fittedHeight,
            left: (-(fittedWidth - width) * (banner?.positionX ?? 50)) / 100,
            top: (-(fittedHeight - height) * (banner?.positionY ?? 50)) / 100,
          }}
        />
      )}
      {children}
    </View>
  );
}
