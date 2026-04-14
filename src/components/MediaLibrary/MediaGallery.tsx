import React from "react";
import { Check as LuCheck } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getCommonMessages } from "@/data/common";
import { type Locale } from "../../../i18n-config";

export interface MediaImage {
  id: string;
  url: string;
  display_name: string;
  format: string;
  width: number;
  height: number;
}

interface MediaGalleryProps {
  data: (MediaImage | { id: null; url: string; display_name: string })[];
  selected: { id: string | null } | null;
  onSelect: (image: any) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  data,
  selected,
  onSelect,
}) => {
  const params = useParams();
  const t = getCommonMessages(params?.locale as Locale).mediaLibrary;
  return (
    <div className="media-gallery">
      {data.map((image, index) => {
        const isUploading = !image.id;
        const isSelected = selected?.id === image.id;

        return (
          <div
            key={image.id || `uploading-${index}`}
            className={clsx("media-item", {
              "media-item--selected": isSelected,
              "media-item--uploading": isUploading,
            })}
            onClick={() => onSelect(image)}
          >
            {image.id && (
              <div className="media-item__checkbox">
                {isSelected && <LuCheck aria-hidden="true" />}
              </div>
            )}

            <div className="media-item__image-wrapper">
              <Image
                src={image.url}
                alt={image.display_name}
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="media-item__info">
              <div className="media-item__name">{image.display_name}</div>
              <div className="media-item__details">
                {"format" in image && (
                  <>
                    <span>{image.format.toUpperCase()}</span>
                    <span> • </span>
                    <span>
                      {image.width} x {image.height}
                    </span>
                  </>
                )}
                {isUploading && <span>{t.uploading}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaGallery;
