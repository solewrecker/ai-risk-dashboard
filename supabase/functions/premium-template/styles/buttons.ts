import { theme } from './theme.ts';

export const getButtonStyles = () => `
  /* === BUTTONS === */
  .print-button {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 100;
  }

  .print-trigger {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
  }

  .print-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .print-icon {
      font-size: 1.5rem;
  }

  .print-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
  }

  .print-label {
      font-weight: 600;
      color: #0f172a;
  }

  .print-format {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
  }

  /* Sparkle elements */
  .print-trigger::after {
      content: '✨';
      position: absolute;
      font-size: 1.2rem;
      top: 0;
      right: 0;
      transform-origin: center;
      opacity: 0;
  }

  .print-trigger:hover::after {
      animation: sparkle 1s ease infinite;
  }

  /* Rainbow shine effect */
  .print-trigger:hover {
      background-image: 
          linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%),
          linear-gradient(45deg, 
              rgba(239, 68, 68, 0.1),
              rgba(234, 179, 8, 0.1),
              rgba(34, 197, 94, 0.1),
              rgba(59, 130, 246, 0.1),
              rgba(168, 85, 247, 0.1)
          );
      background-size: 200% 200%, 400% 400%;
      animation: gradientBG 3s ease infinite;
      border: 2px solid transparent;
      animation: borderGlow 2s ease infinite;
  }

  @media print {
      .print-button {
          display: none;
      }
  }
`; 