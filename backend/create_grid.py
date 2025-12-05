from PIL import Image, ImageDraw

def create_grid_template(width=800, height=800, line_width=2):
    """Create a 4-panel grid template for drawing tutorials."""
    # Create white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)

    # Calculate midpoints
    mid_x = width // 2
    mid_y = height // 2

    # Draw vertical line
    draw.line([(mid_x, 0), (mid_x, height)], fill='black', width=line_width)

    # Draw horizontal line
    draw.line([(0, mid_y), (width, mid_y)], fill='black', width=line_width)

    return img

if __name__ == "__main__":
    # Create and save the grid template
    grid = create_grid_template()
    grid.save("static/grids/grid_template.png")
    print("Grid template created successfully!")