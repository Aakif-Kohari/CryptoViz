import { render, screen } from '@testing-library/react';
import EncodingExplorer from '../../../components/encoding/EncodingExplorer';

describe('EncodingExplorer', () => {
  it('renders the encoding explorer', () => {
    render(<EncodingExplorer />);

    expect(
      screen.getByLabelText('Select encoding scheme')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Select operation')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Convert input')
    ).toBeInTheDocument();

    expect(screen.getByText('Encoding Guide')).toBeInTheDocument();
  });
});