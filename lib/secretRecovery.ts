export interface RecoveryStep {
  id: number;
  title: string;
  description: string;
}

export const recoverySteps: RecoveryStep[] = [
  {
    id: 1,
    title: "Generate Secret",
    description: "A secret value is selected."
  },
  {
    id: 2,
    title: "Split Secret",
    description: "Secret is divided into multiple shares."
  },
  {
    id: 3,
    title: "Distribute Shares",
    description: "Shares are given to participants."
  },
  {
    id: 4,
    title: "Collect Threshold Shares",
    description: "Minimum required shares are gathered."
  },
  {
    id: 5,
    title: "Lagrange Interpolation",
    description: "Polynomial interpolation reconstructs the secret."
  },
  {
    id: 6,
    title: "Recovered Secret",
    description: "Original secret is successfully restored."
  }
];