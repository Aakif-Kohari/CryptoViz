import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SBoxGrid from '../../../components/sbox/SBoxGrid'

const SAMPLE_4X4_GRID = [
  [0x0, 0x1, 0x2, 0x3],
  [0x4, 0x5, 0x6, 0x7],
  [0x8, 0x9, 0xa, 0xb],
  [0xc, 0xd, 0xe, 0xf],
]

describe('SBoxGrid', () => {
  it('renders nothing when empty grid is provided', () => {
    const { container } = render(
      <SBoxGrid grid={[]} activeRow={null} activeCol={null} label="Empty S-Box" />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a grid with proper ARIA roles', () => {
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={null}
        activeCol={null}
        label="Sample 4x4 S-Box"
      />
    )
    expect(screen.getByRole('grid', { name: 'Sample 4x4 S-Box' })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(16)
  })

  it('marks active cell with aria-selected="true" and aria-pressed="true"', () => {
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={1}
        activeCol={2}
        label="Sample 4x4 S-Box"
      />
    )
    const buttons = screen.getAllByRole('button')
    const activeCellBtn = screen.getByRole('button', {
      name: 'Row 1, column 2: output 06',
    })
    expect(activeCellBtn).toHaveAttribute('aria-selected', 'true')
    expect(activeCellBtn).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('implements roving tabindex so only one cell is in tab order', () => {
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={0}
        activeCol={0}
        label="Sample 4x4 S-Box"
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('tabindex', '0')
    expect(buttons[1]).toHaveAttribute('tabindex', '-1')
    expect(buttons[5]).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus with arrow keys (right, down, left, up)', () => {
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={null}
        activeCol={null}
        label="Sample 4x4 S-Box"
      />
    )
    const buttons = screen.getAllByRole('button')
    act(() => buttons[0].focus())
    expect(buttons[0]).toHaveFocus()

    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
    expect(buttons[1]).toHaveFocus()

    fireEvent.keyDown(buttons[1], { key: 'ArrowDown' })
    expect(buttons[5]).toHaveFocus()

    fireEvent.keyDown(buttons[5], { key: 'ArrowLeft' })
    expect(buttons[4]).toHaveFocus()

    fireEvent.keyDown(buttons[4], { key: 'ArrowUp' })
    expect(buttons[0]).toHaveFocus()
  })

  it('handles Home and End keys correctly', () => {
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={null}
        activeCol={null}
        label="Sample 4x4 S-Box"
      />
    )
    const buttons = screen.getAllByRole('button')
    act(() => buttons[5].focus())

    fireEvent.keyDown(buttons[5], { key: 'End' })
    expect(buttons[15]).toHaveFocus()

    fireEvent.keyDown(buttons[15], { key: 'Home' })
    expect(buttons[0]).toHaveFocus()
  })

  it('calls onCellSelect when cell is clicked', () => {
    const handleSelect = vi.fn()
    render(
      <SBoxGrid
        grid={SAMPLE_4X4_GRID}
        activeRow={null}
        activeCol={null}
        label="Sample 4x4 S-Box"
        onCellSelect={handleSelect}
      />
    )
    const targetCell = screen.getByRole('button', {
      name: 'Row 2, column 1: output 09',
    })
    fireEvent.click(targetCell)
    expect(handleSelect).toHaveBeenCalledWith(2, 1)
  })
})
