export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_assets: {
        Row: {
          asset_key: string
          asset_url: string | null
          asset_value: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_key: string
          asset_url?: string | null
          asset_value?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_key?: string
          asset_url?: string | null
          asset_value?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          district: string | null
          id: string
          language: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          photo_url: string | null
          pincode: string | null
          profile_complete: boolean | null
          state: string | null
          surname: string | null
          taluka: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          profile_complete?: boolean | null
          state?: string | null
          surname?: string | null
          taluka?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          profile_complete?: boolean | null
          state?: string | null
          surname?: string | null
          taluka?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          about: string | null
          available: boolean | null
          category: Database["public"]["Enums"]["service_category"]
          city: string
          created_at: string
          email: string | null
          experience: number | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          phone: string
          photo_url: string | null
          price_per_hour: number | null
          rating: number | null
          review_count: number | null
          skills: string[] | null
          status: Database["public"]["Enums"]["provider_status"] | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          about?: string | null
          available?: boolean | null
          category: Database["public"]["Enums"]["service_category"]
          city: string
          created_at?: string
          email?: string | null
          experience?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          phone: string
          photo_url?: string | null
          price_per_hour?: number | null
          rating?: number | null
          review_count?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          about?: string | null
          available?: boolean | null
          category?: Database["public"]["Enums"]["service_category"]
          city?: string
          created_at?: string
          email?: string | null
          experience?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          phone?: string
          photo_url?: string | null
          price_per_hour?: number | null
          rating?: number | null
          review_count?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      provider_status: "pending" | "approved" | "rejected"
      service_category:
        | "plumber"
        | "electrician"
        | "carpenter"
        | "painter"
        | "cleaner"
        | "acRepair"
        | "pestControl"
        | "appliance"
        | "refrigeratorRepair"
        | "washingMachineRepair"
        | "microwaveRepair"
        | "roRepair"
        | "tvRepair"
        | "computerRepair"
        | "mobileRepair"
        | "cctvInstallation"
        | "wifiSetup"
        | "solarPanel"
        | "waterTankCleaning"
        | "houseCleaning"
        | "bathroomCleaning"
        | "kitchenCleaning"
        | "sofaCleaning"
        | "carpetCleaning"
        | "windowCleaning"
        | "gardening"
        | "lawnMowing"
        | "treeCutting"
        | "packersMovers"
        | "furnitureAssembly"
        | "doorLockRepair"
        | "glassRepair"
        | "tileMarbleRepair"
        | "mason"
        | "falseCeiling"
        | "aluminiumWork"
        | "weldingWork"
        | "curtainInstallation"
        | "interiorDesign"
        | "homeRenovation"
        | "generatorRepair"
        | "inverterRepair"
        | "gasStoveRepair"
        | "chimneyRepair"
        | "geyserRepair"
        | "borewellRepair"
        | "drainCleaning"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      provider_status: ["pending", "approved", "rejected"],
      service_category: [
        "plumber",
        "electrician",
        "carpenter",
        "painter",
        "cleaner",
        "acRepair",
        "pestControl",
        "appliance",
        "refrigeratorRepair",
        "washingMachineRepair",
        "microwaveRepair",
        "roRepair",
        "tvRepair",
        "computerRepair",
        "mobileRepair",
        "cctvInstallation",
        "wifiSetup",
        "solarPanel",
        "waterTankCleaning",
        "houseCleaning",
        "bathroomCleaning",
        "kitchenCleaning",
        "sofaCleaning",
        "carpetCleaning",
        "windowCleaning",
        "gardening",
        "lawnMowing",
        "treeCutting",
        "packersMovers",
        "furnitureAssembly",
        "doorLockRepair",
        "glassRepair",
        "tileMarbleRepair",
        "mason",
        "falseCeiling",
        "aluminiumWork",
        "weldingWork",
        "curtainInstallation",
        "interiorDesign",
        "homeRenovation",
        "generatorRepair",
        "inverterRepair",
        "gasStoveRepair",
        "chimneyRepair",
        "geyserRepair",
        "borewellRepair",
        "drainCleaning",
      ],
    },
  },
} as const
