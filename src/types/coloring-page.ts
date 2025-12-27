export type ColoringPageType = 'straight-copy' | 'facial-portrait' | 'cartoon-portrait';

export type BackgroundType = 'plain' | 'mindful-pattern' | 'scene';

export type OrientationType = 'portrait' | 'landscape';

export type SetPieceType = 'none' | 'unicorn' | 'tiny' | 'corner-peel';

export interface ColoringPageFormData {
    type: ColoringPageType;
    imageFiles: File[];
    background: BackgroundType;
    orientation: OrientationType;
    nameOrMessage: string; // Main name/message field
    individualNames: string[]; // For facial portrait names or cartoon activities
    sceneDescription?: string; // Only used when background is 'scene'
    setPiece?: SetPieceType; // Only used for cartoon-portrait type
}

export interface ColoringPageApiData {
    mode: 'edit';
    prompt: string;
    imageFiles: File[];
    size: '1024x1536' | '1536x1024';
    quality: 'medium';
    n: 1;
}
