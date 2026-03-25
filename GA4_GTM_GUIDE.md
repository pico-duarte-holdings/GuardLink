# GA4 & GTM SETUP GUIDE FOR GUARDLINK

## 1. Google Analytics 4 (GA4) Property
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new Property named "GuardLink"
3. Set up a "Web" data stream for `www.guardlink.site`
4. Copy your **Measurement ID** (G-XXXXXXXXXX)

## 2. Google Tag Manager (GTM) Configuration
Your GTM ID is already set up: **GTM-WFPVB5X5**

### Create the GA4 Configuration Tag:
1. In GTM, click **Tags** -> **New**
2. Name it: `GA4 - Config`
3. Tag Type: **Google Analytics: GA4 Configuration**
4. Measurement ID: Paste your ID from step 1
5. Triggering: **All Pages**
6. Save and **Submit/Publish**

### Create Event Tags (Optional but Recommended):
- **Lead Form Submission:**
  - Trigger: Form Submission (Check Validation)
  - Tag: GA4 Event
  - Event Name: `generate_lead`
- **Click to Call:**
  - Trigger: Just Links (URL starts with `tel:`)
  - Tag: GA4 Event
  - Event Name: `contact_recruiter`

## 3. Verify
- Use the "Preview" mode in GTM to ensure tags fire on your site.
- Check the "Real-time" report in GA4 to see your own visits.
