// src/lib/supabase/database.types.ts
// Maa Flavours — Supabase Database TypeScript Types
//
// These types mirror schema.sql exactly.
// They are used by the Supabase client for full type safety.
//
// HOW TO REGENERATE (after schema changes):
//   npx supabase gen types typescript \
//     --project-id <your-project-id> \
//     --schema public > src/lib/supabase/database.types.ts
//
// The types below are hand-maintained to match schema.sql.
// After running the above command, this file will be auto-generated.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {

      // ─── admin_users ──────────────────────────────────────────────
      admin_users: {
        Row: {
          id:             string;
          email:          string;
          password_hash:  string;
          role:           "admin" | "super_admin";
          is_active:      boolean;
          last_login_at:  string | null;
          created_at:     string;
          updated_at:     string;
        };
        Insert: {
          id?:            string;
          email:          string;
          password_hash:  string;
          role?:          "admin" | "super_admin";
          is_active?:     boolean;
          last_login_at?: string | null;
          created_at?:    string;
          updated_at?:    string;
        };
        Update: {
          email?:         string;
          password_hash?: string;
          role?:          "admin" | "super_admin";
          is_active?:     boolean;
          last_login_at?: string | null;
          updated_at?:    string;
        };
        Relationships: [];
      };

      // ─── categories ───────────────────────────────────────────────
      categories: {
        Row: {
          id:          string;
          name:        string;
          slug:        string;
          description: string | null;
          image_url:   string | null;
          sort_order:  number;
          is_active:   boolean;
          created_at:  string;
        };
        Insert: {
          id?:          string;
          name:         string;
          slug:         string;
          description?: string | null;
          image_url?:   string | null;
          sort_order?:  number;
          is_active?:   boolean;
          created_at?:  string;
        };
        Update: {
          name?:        string;
          slug?:        string;
          description?: string | null;
          image_url?:   string | null;
          sort_order?:  number;
          is_active?:   boolean;
        };
        Relationships: [];
      };

      // ─── products ─────────────────────────────────────────────────
      products: {
        Row: {
          id:               string;
          slug:             string;
          name:             string;
          subtitle:         string;
          tag:              string;
          spice_level:      Database["public"]["Enums"]["spice_level_enum"];
          short_description: string;
          description:      string;
          ingredients:      string;
          shelf_life_days:  number;
          is_vegetarian:    boolean;
          is_active:        boolean;
          is_featured:      boolean;
          category_id:      string | null;
          meta_title:       string | null;
          meta_description: string | null;
          average_rating:   number;
          review_count:     number;
          created_at:       string;
          updated_at:       string;
        };
        Insert: {
          id?:               string;
          slug:              string;
          name:              string;
          subtitle:          string;
          tag:               string;
          spice_level?:      Database["public"]["Enums"]["spice_level_enum"];
          short_description: string;
          description:       string;
          ingredients:       string;
          shelf_life_days?:  number;
          is_vegetarian?:    boolean;
          is_active?:        boolean;
          is_featured?:      boolean;
          category_id?:      string | null;
          meta_title?:       string | null;
          meta_description?: string | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: {
          slug?:             string;
          name?:             string;
          subtitle?:         string;
          tag?:              string;
          spice_level?:      Database["public"]["Enums"]["spice_level_enum"];
          short_description?: string;
          description?:      string;
          ingredients?:      string;
          shelf_life_days?:  number;
          is_vegetarian?:    boolean;
          is_active?:        boolean;
          is_featured?:      boolean;
          category_id?:      string | null;
          meta_title?:       string | null;
          meta_description?: string | null;
          updated_at?:       string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── product_variants ─────────────────────────────────────────
      product_variants: {
        Row: {
          id:                  string;
          product_id:          string;
          weight_grams:        number;
          label:               string;
          sku:                 string;
          price:               number;
          discounted_price:    number | null;
          stock_quantity:      number;
          low_stock_threshold: number;
          is_active:           boolean;
          created_at:          string;
          updated_at:          string;
        };
        Insert: {
          id?:                  string;
          product_id:           string;
          weight_grams:         number;
          label:                string;
          sku:                  string;
          price:                number;
          discounted_price?:    number | null;
          stock_quantity?:      number;
          low_stock_threshold?: number;
          is_active?:           boolean;
          created_at?:          string;
          updated_at?:          string;
        };
        Update: {
          product_id?:          string;
          weight_grams?:        number;
          label?:               string;
          sku?:                 string;
          price?:               number;
          discounted_price?:    number | null;
          stock_quantity?:      number;
          low_stock_threshold?: number;
          is_active?:           boolean;
          updated_at?:          string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── product_images ───────────────────────────────────────────
      product_images: {
        Row: {
          id:         string;
          product_id: string;
          url:        string;
          alt:        string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?:         string;
          product_id:  string;
          url:         string;
          alt:         string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?:  string;
          url?:         string;
          alt?:         string;
          is_primary?:  boolean;
          sort_order?:  number;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── customers ────────────────────────────────────────────────
      customers: {
        Row: {
          id:           string;
          mobile:       string;
          name:         string | null;
          email:        string | null;
          is_active:    boolean;
          total_orders: number;
          total_spent:  number;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id:           string;          // must match auth.users.id
          mobile:       string;
          name?:        string | null;
          email?:       string | null;
          is_active?:   boolean;
          total_orders?: number;
          total_spent?: number;
          created_at?:  string;
          updated_at?:  string;
        };
        Update: {
          mobile?:      string;
          name?:        string | null;
          email?:       string | null;
          is_active?:   boolean;
          updated_at?:  string;
        };
        Relationships: [];
      };

      // ─── customer_addresses ───────────────────────────────────────
      customer_addresses: {
        Row: {
          id:            string;
          customer_id:   string;
          name:          string;
          mobile:        string;
          address_line1: string;
          address_line2: string | null;
          landmark:      string | null;
          city:          string;
          state:         string;
          pincode:       string;
          address_type:  "home" | "work" | "other";
          is_default:    boolean;
          created_at:    string;
          updated_at:    string;
        };
        Insert: {
          id?:            string;
          customer_id:    string;
          name:           string;
          mobile:         string;
          address_line1:  string;
          address_line2?: string | null;
          landmark?:      string | null;
          city:           string;
          state:          string;
          pincode:        string;
          address_type?:  "home" | "work" | "other";
          is_default?:    boolean;
          created_at?:    string;
          updated_at?:    string;
        };
        Update: {
          name?:          string;
          mobile?:        string;
          address_line1?: string;
          address_line2?: string | null;
          landmark?:      string | null;
          city?:          string;
          state?:         string;
          pincode?:       string;
          address_type?:  "home" | "work" | "other";
          is_default?:    boolean;
          updated_at?:    string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── coupons ──────────────────────────────────────────────────
      coupons: {
        Row: {
          id:                  string;
          code:                string;
          description:         string | null;
          type:                "flat" | "percent" | "free_shipping";
          value:               number;
          min_order_amount:    number | null;
          max_discount_amount: number | null;
          usage_limit:         number | null;
          usage_count:         number;
          is_active:           boolean;
          valid_from:          string;
          expires_at:          string | null;
          created_at:          string;
          updated_at:          string;
        };
        Insert: {
          id?:                  string;
          code:                 string;
          description?:         string | null;
          type:                 "flat" | "percent" | "free_shipping";
          value:                number;
          min_order_amount?:    number | null;
          max_discount_amount?: number | null;
          usage_limit?:         number | null;
          usage_count?:         number;
          is_active?:           boolean;
          valid_from?:          string;
          expires_at?:          string | null;
          created_at?:          string;
          updated_at?:          string;
        };
        Update: {
          code?:                string;
          description?:         string | null;
          type?:                "flat" | "percent" | "free_shipping";
          value?:               number;
          min_order_amount?:    number | null;
          max_discount_amount?: number | null;
          usage_limit?:         number | null;
          usage_count?:         number;
          is_active?:           boolean;
          valid_from?:          string;
          expires_at?:          string | null;
          updated_at?:          string;
        };
        Relationships: [];
      };

      // ─── orders ───────────────────────────────────────────────────
      orders: {
        Row: {
          id:                  string;
          order_number:        string;
          customer_id:         string;
          shipping_address:    Json;
          status:              Database["public"]["Enums"]["order_status_enum"];
          payment_status:      Database["public"]["Enums"]["payment_status_enum"];
          payment_method:      Database["public"]["Enums"]["payment_method_enum"];
          subtotal:            number;
          discount:            number;
          coupon_discount:     number;
          delivery_charge:     number;
          cod_charge:          number;
          total:               number;
          coupon_code:         string | null;
          razorpay_order_id:   string | null;
          razorpay_payment_id: string | null;
          tracking_id:         string | null;
          courier_name:        string | null;
          tracking_url:        string | null;
          dispatched_at:       string | null;
          delivered_at:        string | null;
          cgst_rate:           number;
          sgst_rate:           number;
          igst_rate:           number;
          cgst_amount:         number;
          sgst_amount:         number;
          igst_amount:         number;
          customer_notes:      string | null;
          internal_notes:      string | null;
          created_at:          string;
          updated_at:          string;
        };
        Insert: {
          id?:                  string;
          order_number?:        string;   // auto-generated by trigger
          customer_id:          string;
          shipping_address:     Json;
          status?:              Database["public"]["Enums"]["order_status_enum"];
          payment_status?:      Database["public"]["Enums"]["payment_status_enum"];
          payment_method:       Database["public"]["Enums"]["payment_method_enum"];
          subtotal:             number;
          discount?:            number;
          coupon_discount?:     number;
          delivery_charge?:     number;
          cod_charge?:          number;
          total:                number;
          coupon_code?:         string | null;
          razorpay_order_id?:   string | null;
          razorpay_payment_id?: string | null;
          tracking_id?:         string | null;
          courier_name?:        string | null;
          tracking_url?:        string | null;
          dispatched_at?:       string | null;
          delivered_at?:        string | null;
          cgst_rate?:           number;
          sgst_rate?:           number;
          igst_rate?:           number;
          cgst_amount?:         number;
          sgst_amount?:         number;
          igst_amount?:         number;
          customer_notes?:      string | null;
          internal_notes?:      string | null;
          created_at?:          string;
          updated_at?:          string;
        };
        Update: {
          status?:              Database["public"]["Enums"]["order_status_enum"];
          payment_status?:      Database["public"]["Enums"]["payment_status_enum"];
          razorpay_order_id?:   string | null;
          razorpay_payment_id?: string | null;
          tracking_id?:         string | null;
          courier_name?:        string | null;
          tracking_url?:        string | null;
          dispatched_at?:       string | null;
          delivered_at?:        string | null;
          cgst_amount?:         number;
          sgst_amount?:         number;
          igst_amount?:         number;
          internal_notes?:      string | null;
          updated_at?:          string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── order_items ──────────────────────────────────────────────
      order_items: {
        Row: {
          id:            string;
          order_id:      string;
          product_id:    string;
          variant_id:    string;
          product_name:  string;
          variant_label: string;
          product_slug:  string;
          product_image: string | null;
          quantity:      number;
          unit_price:    number;
          total_price:   number;
        };
        Insert: {
          id?:            string;
          order_id:       string;
          product_id:     string;
          variant_id:     string;
          product_name:   string;
          variant_label:  string;
          product_slug:   string;
          product_image?: string | null;
          quantity:       number;
          unit_price:     number;
          total_price:    number;
        };
        Update: {
          product_image?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── order_status_history ─────────────────────────────────────
      order_status_history: {
        Row: {
          id:         string;
          order_id:   string;
          old_status: Database["public"]["Enums"]["order_status_enum"] | null;
          new_status: Database["public"]["Enums"]["order_status_enum"];
          changed_by: string;
          note:       string | null;
          created_at: string;
        };
        Insert: {
          id?:         string;
          order_id:    string;
          old_status?: Database["public"]["Enums"]["order_status_enum"] | null;
          new_status:  Database["public"]["Enums"]["order_status_enum"];
          changed_by?: string;
          note?:       string | null;
          created_at?: string;
        };
        Update: never;  // Immutable audit log — no updates
        Relationships: [];
      };

      // ─── product_reviews ──────────────────────────────────────────
      product_reviews: {
        Row: {
          id:                   string;
          product_id:           string;
          customer_id:          string;
          order_id:             string | null;
          rating:               number;
          title:                string | null;
          body:                 string;
          customer_name:        string;
          customer_city:        string | null;
          is_verified_purchase: boolean;
          is_approved:          boolean;
          is_featured:          boolean;
          helpful_count:        number;
          created_at:           string;
          updated_at:           string;
        };
        Insert: {
          id?:                   string;
          product_id:            string;
          customer_id:           string;
          order_id?:             string | null;
          rating:                number;
          title?:                string | null;
          body:                  string;
          customer_name:         string;
          customer_city?:        string | null;
          is_verified_purchase?: boolean;
          is_approved?:          boolean;
          is_featured?:          boolean;
          helpful_count?:        number;
          created_at?:           string;
          updated_at?:           string;
        };
        Update: {
          rating?:               number;
          title?:                string | null;
          body?:                 string;
          is_approved?:          boolean;
          is_featured?:          boolean;
          helpful_count?:        number;
          updated_at?:           string;
        };
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─── otp_sessions ─────────────────────────────────────────────
      otp_sessions: {
        Row: {
          id:            string;
          mobile:        string;
          otp_hash:      string;
          attempt_count: number;
          is_verified:   boolean;
          expires_at:    string;
          created_at:    string;
        };
        Insert: {
          id?:            string;
          mobile:         string;
          otp_hash:       string;
          attempt_count?: number;
          is_verified?:   boolean;
          expires_at?:    string;
          created_at?:    string;
        };
        Update: {
          otp_hash?:      string;
          attempt_count?: number;
          is_verified?:   boolean;
          expires_at?:    string;
        };
        Relationships: [];
      };

      // ─── newsletter_subscribers ───────────────────────────────────
      newsletter_subscribers: {
        Row: {
          id:          string;
          email:       string;
          name:        string | null;
          coupon_sent: boolean;
          is_active:   boolean;
          source:      string;
          created_at:  string;
        };
        Insert: {
          id?:          string;
          email:        string;
          name?:        string | null;
          coupon_sent?: boolean;
          is_active?:   boolean;
          source?:      string;
          created_at?:  string;
        };
        Update: {
          name?:        string | null;
          coupon_sent?: boolean;
          is_active?:   boolean;
        };
        Relationships: [];
      };

      // ─── contact_messages ─────────────────────────────────────────
      contact_messages: {
        Row: {
          id:          string;
          name:        string;
          mobile:      string;
          email:       string | null;
          topic:       string;
          message:     string;
          is_read:     boolean;
          is_resolved: boolean;
          admin_notes: string | null;
          created_at:  string;
        };
        Insert: {
          id?:          string;
          name:         string;
          mobile:       string;
          email?:       string | null;
          topic:        string;
          message:      string;
          is_read?:     boolean;
          is_resolved?: boolean;
          admin_notes?: string | null;
          created_at?:  string;
        };
        Update: {
          is_read?:     boolean;
          is_resolved?: boolean;
          admin_notes?: string | null;
        };
        Relationships: [];
      };

      // ─── blog_posts ───────────────────────────────────────────────
      blog_posts: {
        Row: {
          id:              string;
          slug:            string;
          title:           string;
          subtitle:        string;
          excerpt:         string;
          body:            Json;
          category:        Database["public"]["Enums"]["blog_category_enum"];
          category_label:  string;
          emoji:           string;
          read_time:       string;
          author_name:     string;
          author_role:     string;
          tags:            string[];
          is_featured:     boolean;
          is_published:    boolean;
          published_at:    string;
          related_slugs:   string[];
          cover_image_url: string | null;
          meta_title:      string | null;
          meta_description: string | null;
          created_at:      string;
          updated_at:      string;
        };
        Insert: {
          id?:              string;
          slug:             string;
          title:            string;
          subtitle:         string;
          excerpt:          string;
          body?:            Json;
          category:         Database["public"]["Enums"]["blog_category_enum"];
          category_label:   string;
          emoji?:           string;
          read_time?:       string;
          author_name?:     string;
          author_role?:     string;
          tags?:            string[];
          is_featured?:     boolean;
          is_published?:    boolean;
          published_at?:    string;
          related_slugs?:   string[];
          cover_image_url?: string | null;
          meta_title?:      string | null;
          meta_description?: string | null;
          created_at?:      string;
          updated_at?:      string;
        };
        Update: {
          title?:            string;
          subtitle?:         string;
          excerpt?:          string;
          body?:             Json;
          category?:         Database["public"]["Enums"]["blog_category_enum"];
          category_label?:   string;
          emoji?:            string;
          read_time?:        string;
          is_featured?:      boolean;
          is_published?:     boolean;
          published_at?:     string;
          related_slugs?:    string[];
          cover_image_url?:  string | null;
          meta_title?:       string | null;
          meta_description?: string | null;
          updated_at?:       string;
        };
        Relationships: [];
      };

      // ─── expenses ─────────────────────────────────────────────────
      expenses: {
        Row: {
          id:           string;
          category:     Database["public"]["Enums"]["expense_category_enum"];
          description:  string;
          amount:       number;
          expense_date: string;
          receipt_url:  string | null;
          added_by:     string | null;
          notes:        string | null;
          created_at:   string;
        };
        Insert: {
          id?:           string;
          category:      Database["public"]["Enums"]["expense_category_enum"];
          description:   string;
          amount:        number;
          expense_date?: string;
          receipt_url?:  string | null;
          added_by?:     string | null;
          notes?:        string | null;
          created_at?:   string;
        };
        Update: {
          category?:     Database["public"]["Enums"]["expense_category_enum"];
          description?:  string;
          amount?:       number;
          expense_date?: string;
          receipt_url?:  string | null;
          notes?:        string | null;
        };
        Relationships: [];
      };

      // ─── settings ─────────────────────────────────────────────────
      settings: {
        Row: {
          key:         string;
          value:       Json;
          description: string | null;
          updated_at:  string;
        };
        Insert: {
          key:          string;
          value:        Json;
          description?: string | null;
          updated_at?:  string;
        };
        Update: {
          value?:       Json;
          description?: string | null;
          updated_at?:  string;
        };
        Relationships: [];
      };
    };

    Views: {
      products_with_details: {
        Row: {
          // All products columns, plus:
          primary_image_url:  string | null;
          primary_image_alt:  string | null;
          min_price:          number | null;
          max_price:          number | null;
          min_effective_price: number | null;
          total_stock:        number | null;
          variant_count:      number | null;
          has_low_stock:      boolean | null;
          is_out_of_stock:    boolean | null;
        } & Database["public"]["Tables"]["products"]["Row"];
      };
      orders_summary: {
        Row: {
          customer_name:    string | null;
          customer_mobile:  string | null;
          customer_email:   string | null;
          item_count:       number | null;
          total_quantity:   number | null;
        } & Database["public"]["Tables"]["orders"]["Row"];
      };
      low_stock_variants: {
        Row: {
          product_name:   string;
          product_slug:   string;
        } & Database["public"]["Tables"]["product_variants"]["Row"];
      };
    };

    Functions: {
      fn_generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };

    Enums: {
      spice_level_enum:       "mild" | "medium" | "spicy" | "extra-hot";
      order_status_enum:      "pending" | "confirmed" | "processing" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
      payment_status_enum:    "pending" | "paid" | "failed" | "refunded";
      payment_method_enum:    "razorpay_upi" | "razorpay_card" | "razorpay_netbanking" | "cod";
      coupon_type_enum:       "flat" | "percent" | "free_shipping";
      address_type_enum:      "home" | "work" | "other";
      admin_role_enum:        "admin" | "super_admin";
      expense_category_enum:  "ingredients" | "packaging" | "delivery" | "marketing" | "utilities" | "other";
      blog_category_enum:     "recipe" | "culture" | "health" | "tips" | "behind-the-scenes";
    };
  };
};

// ─── Convenience type aliases ─────────────────────────────────────────────
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type DbProduct          = Tables<"products">;
export type DbProductVariant   = Tables<"product_variants">;
export type DbProductImage     = Tables<"product_images">;
export type DbCategory         = Tables<"categories">;
export type DbCustomer         = Tables<"customers">;
export type DbAddress          = Tables<"customer_addresses">;
export type DbOrder            = Tables<"orders">;
export type DbOrderItem        = Tables<"order_items">;
export type DbOrderStatusHistory = Tables<"order_status_history">;
export type DbProductReview    = Tables<"product_reviews">;
export type DbCoupon           = Tables<"coupons">;
export type DbBlogPost         = Tables<"blog_posts">;
export type DbExpense          = Tables<"expenses">;
export type DbSetting          = Tables<"settings">;
export type DbAdminUser        = Tables<"admin_users">;
export type DbOtpSession       = Tables<"otp_sessions">;
export type DbNewsletterSub    = Tables<"newsletter_subscribers">;
export type DbContactMessage   = Tables<"contact_messages">;

// View types
export type ProductWithDetails = Database["public"]["Views"]["products_with_details"]["Row"];
export type OrderSummary       = Database["public"]["Views"]["orders_summary"]["Row"];
export type LowStockVariant    = Database["public"]["Views"]["low_stock_variants"]["Row"];

// Insert types (used in API routes)
export type InsertOrder     = Database["public"]["Tables"]["orders"]["Insert"];
export type InsertOrderItem = Database["public"]["Tables"]["order_items"]["Insert"];
export type InsertCustomer  = Database["public"]["Tables"]["customers"]["Insert"];
export type InsertAddress   = Database["public"]["Tables"]["customer_addresses"]["Insert"];
export type InsertReview    = Database["public"]["Tables"]["product_reviews"]["Insert"];
export type InsertCoupon    = Database["public"]["Tables"]["coupons"]["Insert"];
export type InsertExpense   = Database["public"]["Tables"]["expenses"]["Insert"];
