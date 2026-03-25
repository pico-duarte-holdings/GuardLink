/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_LEADS_SCRIPT_URL: string;
  readonly VITE_DASHBOARD_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
