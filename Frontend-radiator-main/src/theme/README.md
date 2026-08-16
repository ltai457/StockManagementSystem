# Frontend design system

The application uses Material UI as its shared design system. Prefer reusable
components from `components/common/ui` instead of adding page-specific CSS.

## Common components

```tsx
import {
  AppCard,
  AppTable,
  AppTextField,
  Button,
  Modal,
} from "../components/common/ui";
```

```tsx
<Button>Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="danger">Delete</Button>

<AppTextField label="Product code" required />

<AppCard title="Product details">
  Card content
</AppCard>
```

## Where to make visual changes

- `colors.ts`: application colours
- `typography.ts`: fonts and heading sizes
- `componentOverrides.ts`: global MUI component appearance
- `index.ts`: complete theme configuration

Changing these files updates the shared appearance throughout the application.
Use an `sx` prop only for layout or a genuinely unique component variation.
