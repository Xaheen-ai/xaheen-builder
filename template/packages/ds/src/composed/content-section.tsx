/**
 * Content Section Component
 * 
 * High-level section component for grouping related content
 */

import React, { forwardRef } from 'react';
import { Fieldset, Heading } from '@digdir/designsystemet-react';
import { Stack } from '../primitives';

export interface ContentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Section subtitle
   */
  subtitle?: string;
  
  /**
   * Whether to use Fieldset wrapper
   * @default true
   */
  fieldset?: boolean;
  
  /**
   * Spacing below the section
   * @default 32
   */
  spacing?: number;
  
  /**
   * Heading level for the title
   * @default 2
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * Direction of content
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  
  /**
   * Spacing between content items
   * @default 16
   */
  contentSpacing?: number;
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  ({
    children,
    title,
    subtitle,
    fieldset = true,
    spacing = 32,
    level = 2,
    direction = 'vertical',
    contentSpacing = 16,
    className,
    style,
    ...props
  }, ref) => {
    const sectionStyle = {
      marginBottom: spacing,
      ...style
    };

    const header = (
      <Stack spacing={8} style={{ marginBottom: subtitle ? 16 : 24 }}>
        {title && (
          <Heading level={level}>
            {title}
          </Heading>
        )}
        {subtitle && (
          <p style={{ opacity: 0.8, margin: 0 }}>
            {subtitle}
          </p>
        )}
      </Stack>
    );

    const content = (
      <Stack direction={direction} spacing={contentSpacing}>
        {children}
      </Stack>
    );

    if (fieldset) {
      return (
        <Fieldset
          ref={ref as any}
          className={className}
          style={sectionStyle}
          {...(props as any)}
        >
          {header}
          {content}
        </Fieldset>
      );
    }

    return (
      <div ref={ref} className={className} style={sectionStyle} {...props}>
        {header}
        {content}
      </div>
    );
  }
);

ContentSection.displayName = 'ContentSection';
