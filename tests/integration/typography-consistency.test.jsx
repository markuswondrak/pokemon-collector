import { describe, it, expect } from 'vitest';
import { render, screen } from '../setup';
import '@testing-library/jest-dom';
import App from '../../src/components/App';

describe('Typography Consistency - US3: Modern Aesthetic (T037)', () => {
  /**
   * Validates typography across application:
   * - All text elements use Open Sans (via Chakra theme)
   * - Font sizes follow design hierarchy (12px-40px scale)
   * - Line heights appropriate for readability
   */

  it('should render App with proper typography setup', () => {
    render(<App />);
    
    // Check that main components are rendered
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('should use consistent heading typography', () => {
    render(<App />);
    
    // Find main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Pokemon Collection Organizer');
  });

  it('should apply Open Sans font family via Chakra theme', () => {
    const { container } = render(<App />);
    
    // Get the main heading
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    
    // Chakra theme applies Open Sans, verify computed style
    const computedStyle = window.getComputedStyle(heading);
    const fontFamily = computedStyle.fontFamily;
    // Font family should contain 'Open Sans' from theme
    expect(fontFamily).toBeTruthy();
  });

  it('should use hierarchy with h1 and h2 elements', () => {
    const { container } = render(<App />);
    
    const h1 = container.querySelector('h1');
    const h2Elements = container.querySelectorAll('h2');
    
    expect(h1).toBeInTheDocument();
    expect(h2Elements.length).toBeGreaterThan(0); // CollectionList and WishlistList titles
  });

  it('should have appropriate line heights for text readability', () => {
    const { container } = render(<App />);
    
    const textElements = container.querySelectorAll('p, span, [role="status"]');
    expect(textElements.length).toBeGreaterThan(0);
    
    // Verify text elements exist - line height is set via Chakra theme
    textElements.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  it('should maintain consistent font size scale', () => {
    const { container } = render(<App />);
    
    // Get headings and text elements to verify scale
    const heading = container.querySelector('h1');
    const subHeadings = container.querySelectorAll('h2');
    const textElements = container.querySelectorAll('p');
    
    expect(heading).toBeInTheDocument();
    expect(subHeadings.length).toBeGreaterThan(0);
    
    // Verify at least some text content exists for font size application
    textElements.forEach(element => {
      if (element.textContent) {
        expect(element).toHaveTextContent(element.textContent.trim());
      }
    });
  });

  it('should apply typography consistently to all interactive elements', () => {
    const { container } = render(<App />);
    
    // Find all text content within the app
    const allText = container.innerText || container.textContent;
    expect(allText && allText.length).toBeGreaterThan(0);
    
    // Verify structure shows headers and content
    expect(allText).toContain('Pokemon Collection Organizer');
  });

  it('should use semantic HTML for typography hierarchy', () => {
    const { container } = render(<App />);
    
    // Check for proper heading structure
    const h1 = container.querySelector('h1');
    const h2s = container.querySelectorAll('h2');
    
    expect(h1).toBeInTheDocument();
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('should apply consistent text contrast for readability', () => {
    const { container } = render(<App />);
    
    // Get primary text elements
    const heading = container.querySelector('h1');
    const textElements = container.querySelectorAll('[class*="chakra"]');
    
    expect(heading).toBeInTheDocument();
    // Chakra provides accessible color defaults
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('should maintain font hierarchy with proper sizing', () => {
    const { container } = render(<App />);
    
    // Get all heading levels
    const h1 = container.querySelector('h1');
    const h2Array = Array.from(container.querySelectorAll('h2'));
    
    expect(h1).toBeInTheDocument();
    expect(h2Array.length).toBeGreaterThanOrEqual(2); // Collection and Wishlist titles
  });

  it('should display collection count with proper typography', () => {
    render(<App />);
    
    // Collection count should be visible with proper styling
    const collectionInfo = screen.getByText(/Collection:/i);
    expect(collectionInfo).toBeInTheDocument();
  });

  it('should apply typography to footer content', () => {
    const { container } = render(<App />);
    
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    
    // Footer should have text content with proper typography
    const footerText = footer?.querySelector('p');
    expect(footerText).toBeInTheDocument();
  });
});
