-- Seed test users for local development
-- These users are created in the auth schema and can be used to test the demo
--
-- NOTE: GoTrue scans auth.users token columns as non-null strings, so the
-- token columns must be seeded as '' (not NULL) or password sign-in fails with
-- "converting NULL to string is unsupported".

-- Test user: test@test.com / password123 (regular user)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change_token,
  phone_change, phone, reauthentication_token,
  email_change_confirm_status, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'test@test.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email_verified":true}',
  false,
  '', '', '', '', '', '', '', '+10000000000', '',
  0, false, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"test@test.com"}',
  'email',
  '00000000-0000-0000-0000-000000000001',
  now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

-- Admin user: admin@test.com / password123
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change_token,
  phone_change, phone, reauthentication_token,
  email_change_confirm_status, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"email_verified":true}',
  false,
  '', '', '', '', '', '', '', '+10000000001', '',
  0, false, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"admin@test.com"}',
  'email',
  '00000000-0000-0000-0000-000000000002',
  now(), now(), now()
) ON CONFLICT (id) DO NOTHING;
