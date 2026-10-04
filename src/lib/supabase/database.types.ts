
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "admins": {
                  Row: {
                    "created_at": string,"display_name": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"display_name": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"collections": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"image_id": string | null,"is_published": boolean,"name": string,"seo_description": string,"seo_title": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string,"id"?: string,"image_id"?: string | null,"is_published"?: boolean,"name": string,"seo_description"?: string,"seo_title"?: string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"image_id"?: string | null,"is_published"?: boolean,"name"?: string,"seo_description"?: string,"seo_title"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "collections_image_id_fkey"
      columns: ["image_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_messages": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"message": string,"name": string,"notification_sent_at": string | null,"order_number": string,"status": Database["public"]['Enums']["message_status"],"subject": string
                  }
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"message": string,"name": string,"notification_sent_at"?: string | null,"order_number"?: string,"status"?: Database["public"]['Enums']["message_status"],"subject"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"message"?: string,"name"?: string,"notification_sent_at"?: string | null,"order_number"?: string,"status"?: Database["public"]['Enums']["message_status"],"subject"?: string
                  }
                  Relationships: [
                    
                  ]
                },"faq_items": {
                  Row: {
                    "answer": string,"created_at": string,"id": string,"is_published": boolean,"question": string,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "answer": string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"question": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "answer"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"question"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"media": {
                  Row: {
                    "alt": string,"bucket": string,"created_at": string,"created_by": string | null,"focal_x": number,"focal_y": number,"height": number,"id": string,"is_placeholder": boolean,"mime_type": string,"original_filename": string | null,"path": string,"size_bytes": number,"updated_at": string,"width": number
                  }
                  Insert: {
                    "alt"?: string,"bucket"?: string,"created_at"?: string,"created_by"?: string | null,"focal_x"?: number,"focal_y"?: number,"height": number,"id"?: string,"is_placeholder"?: boolean,"mime_type": string,"original_filename"?: string | null,"path": string,"size_bytes": number,"updated_at"?: string,"width": number
                  }
                  Update: {
                    "alt"?: string,"bucket"?: string,"created_at"?: string,"created_by"?: string | null,"focal_x"?: number,"focal_y"?: number,"height"?: number,"id"?: string,"is_placeholder"?: boolean,"mime_type"?: string,"original_filename"?: string | null,"path"?: string,"size_bytes"?: number,"updated_at"?: string,"width"?: number
                  }
                  Relationships: [
                    
                  ]
                },"newsletter_subscribers": {
                  Row: {
                    "confirm_token": string,"confirmed_at": string | null,"consent_at": string,"consent_text": string,"created_at": string,"email": string,"id": string,"status": Database["public"]['Enums']["subscriber_status"],"unsubscribe_token": string,"unsubscribed_at": string | null
                  }
                  Insert: {
                    "confirm_token": string,"confirmed_at"?: string | null,"consent_at"?: string,"consent_text": string,"created_at"?: string,"email": string,"id"?: string,"status"?: Database["public"]['Enums']["subscriber_status"],"unsubscribe_token": string,"unsubscribed_at"?: string | null
                  }
                  Update: {
                    "confirm_token"?: string,"confirmed_at"?: string | null,"consent_at"?: string,"consent_text"?: string,"created_at"?: string,"email"?: string,"id"?: string,"status"?: Database["public"]['Enums']["subscriber_status"],"unsubscribe_token"?: string,"unsubscribed_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "created_at": string,"id": string,"image_path": string | null,"line_total_cents": number,"order_id": string,"personalization": NonNullable<Json>,"product_id": string | null,"product_name": string,"product_slug": string,"quantity": number,"size_label": string,"stock_limited": boolean,"unit_price_cents": number,"variant_id": string | null,"variant_name": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"image_path"?: string | null,"line_total_cents": number,"order_id": string,"personalization"?: NonNullable<Json>,"product_id"?: string | null,"product_name": string,"product_slug"?: string,"quantity": number,"size_label"?: string,"stock_limited"?: boolean,"unit_price_cents": number,"variant_id"?: string | null,"variant_name"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"image_path"?: string | null,"line_total_cents"?: number,"order_id"?: string,"personalization"?: NonNullable<Json>,"product_id"?: string | null,"product_name"?: string,"product_slug"?: string,"quantity"?: number,"size_label"?: string,"stock_limited"?: boolean,"unit_price_cents"?: number,"variant_id"?: string | null,"variant_name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "amount_received_cents": number | null,"carrier": string,"confirmation_email_claimed_at": string | null,"confirmation_email_sent_at": string | null,"created_at": string,"currency": string,"customer_email": string | null,"customer_name": string | null,"customer_phone": string | null,"fulfillment_status": Database["public"]['Enums']["fulfillment_status"],"id": string,"internal_note": string,"last_email_error": string | null,"order_number": string,"paid_at": string | null,"payment_status": Database["public"]['Enums']["payment_status"],"public_token": string,"shipped_at": string | null,"shipping_address": Json | null,"shipping_cents": number,"shipping_country": string,"shipping_email_claimed_at": string | null,"shipping_email_sent_at": string | null,"shipping_zone_id": string | null,"shipping_zone_name": string,"shop_notification_sent_at": string | null,"stock_released": boolean,"stock_reserved": boolean,"stripe_payment_intent_id": string | null,"stripe_session_id": string | null,"subtotal_cents": number,"total_cents": number,"tracking_number": string,"tracking_url": string,"updated_at": string
                  }
                  Insert: {
                    "amount_received_cents"?: number | null,"carrier"?: string,"confirmation_email_claimed_at"?: string | null,"confirmation_email_sent_at"?: string | null,"created_at"?: string,"currency"?: string,"customer_email"?: string | null,"customer_name"?: string | null,"customer_phone"?: string | null,"fulfillment_status"?: Database["public"]['Enums']["fulfillment_status"],"id"?: string,"internal_note"?: string,"last_email_error"?: string | null,"order_number": string,"paid_at"?: string | null,"payment_status"?: Database["public"]['Enums']["payment_status"],"public_token": string,"shipped_at"?: string | null,"shipping_address"?: Json | null,"shipping_cents": number,"shipping_country"?: string,"shipping_email_claimed_at"?: string | null,"shipping_email_sent_at"?: string | null,"shipping_zone_id"?: string | null,"shipping_zone_name"?: string,"shop_notification_sent_at"?: string | null,"stock_released"?: boolean,"stock_reserved"?: boolean,"stripe_payment_intent_id"?: string | null,"stripe_session_id"?: string | null,"subtotal_cents": number,"total_cents": number,"tracking_number"?: string,"tracking_url"?: string,"updated_at"?: string
                  }
                  Update: {
                    "amount_received_cents"?: number | null,"carrier"?: string,"confirmation_email_claimed_at"?: string | null,"confirmation_email_sent_at"?: string | null,"created_at"?: string,"currency"?: string,"customer_email"?: string | null,"customer_name"?: string | null,"customer_phone"?: string | null,"fulfillment_status"?: Database["public"]['Enums']["fulfillment_status"],"id"?: string,"internal_note"?: string,"last_email_error"?: string | null,"order_number"?: string,"paid_at"?: string | null,"payment_status"?: Database["public"]['Enums']["payment_status"],"public_token"?: string,"shipped_at"?: string | null,"shipping_address"?: Json | null,"shipping_cents"?: number,"shipping_country"?: string,"shipping_email_claimed_at"?: string | null,"shipping_email_sent_at"?: string | null,"shipping_zone_id"?: string | null,"shipping_zone_name"?: string,"shop_notification_sent_at"?: string | null,"stock_released"?: boolean,"stock_reserved"?: boolean,"stripe_payment_intent_id"?: string | null,"stripe_session_id"?: string | null,"subtotal_cents"?: number,"total_cents"?: number,"tracking_number"?: string,"tracking_url"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_shipping_zone_id_fkey"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"pages": {
                  Row: {
                    "body": string,"is_complete": boolean,"seo_description": string,"slug": string,"sort_order": number,"title": string,"updated_at": string
                  }
                  Insert: {
                    "body"?: string,"is_complete"?: boolean,"seo_description"?: string,"slug": string,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"is_complete"?: boolean,"seo_description"?: string,"slug"?: string,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"product_collections": {
                  Row: {
                    "collection_id": string,"product_id": string,"sort_order": number
                  }
                  Insert: {
                    "collection_id": string,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "collection_id"?: string,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_collections_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_collections_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_images": {
                  Row: {
                    "alt_override": string,"created_at": string,"id": string,"media_id": string,"product_id": string,"sort_order": number,"variant_id": string | null
                  }
                  Insert: {
                    "alt_override"?: string,"created_at"?: string,"id"?: string,"media_id": string,"product_id": string,"sort_order"?: number,"variant_id"?: string | null
                  }
                  Update: {
                    "alt_override"?: string,"created_at"?: string,"id"?: string,"media_id"?: string,"product_id"?: string,"sort_order"?: number,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_images_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "created_at": string,"finish": string,"id": string,"is_active": boolean,"name": string,"price_cents": number | null,"product_id": string,"sku": string,"sort_order": number,"stock_quantity": number | null,"swatch": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"finish"?: string,"id"?: string,"is_active"?: boolean,"name": string,"price_cents"?: number | null,"product_id": string,"sku"?: string,"sort_order"?: number,"stock_quantity"?: number | null,"swatch"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"finish"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"price_cents"?: number | null,"product_id"?: string,"sku"?: string,"sort_order"?: number,"stock_quantity"?: number | null,"swatch"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "base_price_cents": number,"care_info": string,"created_at": string,"description": string,"dimensions": string,"fabrication_delay": string,"featured_order": number,"id": string,"is_available": boolean,"is_featured": boolean,"material": string,"name": string,"name_enabled": boolean,"name_max_length": number,"name_required": boolean,"personalization_info": string,"phone_enabled": boolean,"phone_max_length": number,"phone_required": boolean,"published_at": string | null,"seo_description": string,"seo_title": string,"shape": string,"short_description": string,"size_label": string,"slug": string,"sort_order": number,"status": Database["public"]['Enums']["product_status"],"stock_mode": Database["public"]['Enums']["stock_mode"],"story_image_id": string | null,"story_text": string,"story_title": string,"updated_at": string
                  }
                  Insert: {
                    "base_price_cents": number,"care_info"?: string,"created_at"?: string,"description"?: string,"dimensions"?: string,"fabrication_delay"?: string,"featured_order"?: number,"id"?: string,"is_available"?: boolean,"is_featured"?: boolean,"material"?: string,"name": string,"name_enabled"?: boolean,"name_max_length"?: number,"name_required"?: boolean,"personalization_info"?: string,"phone_enabled"?: boolean,"phone_max_length"?: number,"phone_required"?: boolean,"published_at"?: string | null,"seo_description"?: string,"seo_title"?: string,"shape"?: string,"short_description"?: string,"size_label"?: string,"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["product_status"],"stock_mode"?: Database["public"]['Enums']["stock_mode"],"story_image_id"?: string | null,"story_text"?: string,"story_title"?: string,"updated_at"?: string
                  }
                  Update: {
                    "base_price_cents"?: number,"care_info"?: string,"created_at"?: string,"description"?: string,"dimensions"?: string,"fabrication_delay"?: string,"featured_order"?: number,"id"?: string,"is_available"?: boolean,"is_featured"?: boolean,"material"?: string,"name"?: string,"name_enabled"?: boolean,"name_max_length"?: number,"name_required"?: boolean,"personalization_info"?: string,"phone_enabled"?: boolean,"phone_max_length"?: number,"phone_required"?: boolean,"published_at"?: string | null,"seo_description"?: string,"seo_title"?: string,"shape"?: string,"short_description"?: string,"size_label"?: string,"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["product_status"],"stock_mode"?: Database["public"]['Enums']["stock_mode"],"story_image_id"?: string | null,"story_text"?: string,"story_title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_story_image_id_fkey"
      columns: ["story_image_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "hits": number,"key": string,"window_start": string
                  }
                  Insert: {
                    "hits"?: number,"key": string,"window_start"?: string
                  }
                  Update: {
                    "hits"?: number,"key"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"shipping_zones": {
                  Row: {
                    "countries": (string)[],"created_at": string,"delay_text": string,"free_from_cents": number | null,"id": string,"is_active": boolean,"name": string,"price_cents": number,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "countries": (string)[],"created_at"?: string,"delay_text"?: string,"free_from_cents"?: number | null,"id"?: string,"is_active"?: boolean,"name": string,"price_cents": number,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "countries"?: (string)[],"created_at"?: string,"delay_text"?: string,"free_from_cents"?: number | null,"id"?: string,"is_active"?: boolean,"name"?: string,"price_cents"?: number,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "is_public": boolean,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  Insert: {
                    "is_public"?: boolean,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Update: {
                    "is_public"?: boolean,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"stripe_events": {
                  Row: {
                    "attempts": number,"id": string,"last_error": string | null,"processed_at": string | null,"received_at": string,"type": string
                  }
                  Insert: {
                    "attempts"?: number,"id": string,"last_error"?: string | null,"processed_at"?: string | null,"received_at"?: string,"type": string
                  }
                  Update: {
                    "attempts"?: number,"id"?: string,"last_error"?: string | null,"processed_at"?: string | null,"received_at"?: string,"type"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_duplicate_product":
{ Args: { "p_id": string }; Returns: string
                           },
"admin_save_product":
{ Args: { "p": Json }; Returns: string
                           },
"cancel_unpaid_order":
{ Args: { "p_order_id": string }; Returns: undefined
                           },
"claim_order_email":
{ Args: { "p_kind": string,"p_order_id": string }; Returns: boolean
                           },
"create_order":
{ Args: { "p_items": Json,"p_order": Json }; Returns: {
              "order_id": string,"order_number": string,"public_token": string
            }[]
                           },
"finish_order_email":
{ Args: { "p_error": string,"p_kind": string,"p_order_id": string }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"media_is_public":
{ Args: { "p_media_id": string }; Returns: boolean
                           },
"media_usage":
{ Args: { "p_media_id": string }; Returns: Json
                           },
"payment_async_succeeded":
{ Args: { "p_amount_total": number,"p_session_id": string }; Returns: {
              "changed": boolean,"order_id": string,"payment_status": Database["public"]['Enums']["payment_status"]
            }[]
                           },
"payment_checkout_completed":
{ Args: { "p_amount_total": number,"p_customer": Json,"p_is_paid": boolean,"p_payment_intent": string,"p_session_id": string }; Returns: {
              "changed": boolean,"order_id": string,"payment_status": Database["public"]['Enums']["payment_status"]
            }[]
                           },
"payment_closed":
{ Args: { "p_session_id": string,"p_status": Database["public"]['Enums']["payment_status"] }; Returns: {
              "changed": boolean,"order_id": string,"payment_status": Database["public"]['Enums']["payment_status"]
            }[]
                           },
"payment_refunded":
{ Args: { "p_fully": boolean,"p_payment_intent": string }; Returns: {
              "changed": boolean,"order_id": string,"payment_status": Database["public"]['Enums']["payment_status"]
            }[]
                           },
"rate_limit_hit":
{ Args: { "p_key": string,"p_limit": number,"p_window_seconds": number }; Returns: boolean
                           },
"release_order_stock":
{ Args: { "p_order_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "fulfillment_status": "new"|"in_production"|"ready"|"shipped"|"delivered"|"cancelled","message_status": "new"|"read"|"archived","payment_status": "pending"|"processing"|"paid"|"failed"|"expired"|"cancelled"|"refunded"|"review","product_status": "draft"|"published"|"archived","stock_mode": "made_to_order"|"limited","subscriber_status": "pending"|"confirmed"|"unsubscribed"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "fulfillment_status": ["new", "in_production", "ready", "shipped", "delivered", "cancelled"],"message_status": ["new", "read", "archived"],"payment_status": ["pending", "processing", "paid", "failed", "expired", "cancelled", "refunded", "review"],"product_status": ["draft", "published", "archived"],"stock_mode": ["made_to_order", "limited"],"subscriber_status": ["pending", "confirmed", "unsubscribed"]
          }
        }
} as const
