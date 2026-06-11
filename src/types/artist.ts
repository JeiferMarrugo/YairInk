export type ArtistRecord = {
  id: string;
  name: string;
  phone: string;
  phoneDisplay: string | null;
  email: string | null;
  specialty: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateArtistInput = {
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  photoUrl?: string;
  isActive?: boolean;
};

export type UpdateArtistInput = Partial<CreateArtistInput> & {
  photoUrl?: string | null;
};
