# OSMD Proof of Concept

A complete demonstration of OpenSheetMusicDisplay (OSMD) integration for rendering music sheets from MusicXML data.

## 🎼 Overview

This Proof of Concept demonstrates how to integrate OpenSheetMusicDisplay into a web application for rendering musical notation from MusicXML format. It showcases different complexity levels of musical content and provides an interactive interface for exploring OSMD capabilities.

## 📋 Features

### Core Functionality
- **OSMD Integration**: Complete integration with OpenSheetMusicDisplay library via CDN
- **MusicXML Rendering**: Load and render musical notation from embedded MusicXML data
- **Interactive Controls**: Dropdown selection, render button, and clear functionality
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error handling for invalid MusicXML or rendering issues

### Sample Content
- **Simple Melody**: Basic melody demonstrating fundamental musical elements
- **Chord Progression**: Intermediate example with harmony and chord symbols
- **Multi-Staff Composition**: Advanced piano piece with treble and bass clef

### Performance Features
- **Efficient Rendering**: Optimized OSMD configuration for smooth performance
- **Memory Management**: Proper cleanup when switching between sheets
- **Loading States**: Visual feedback during sheet loading and rendering
- **Auto-Resize**: Automatic adjustment to different screen sizes

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection (for OSMD CDN)

### Quick Start

1. **Clone or download** this repository
2. **Navigate** to the `osmd-poc` directory
3. **Open** `index.html` in your web browser
   - Or use `demo.html` for a functionality preview without external dependencies
4. **Select** a music sheet from the dropdown
5. **Click** "Render Sheet" to display the notation
6. **Use** "Clear" to reset and try another sheet

**Note**: If you encounter CDN loading issues with `index.html`, use `demo.html` which demonstrates all UI functionality without external dependencies.

### File Structure
```
osmd-poc/
├── index.html              # Main HTML page with OSMD integration
├── demo.html               # Demo version showing UI functionality  
├── style.css               # Styling and responsive design
├── script.js               # JavaScript logic and OSMD integration
├── README.md               # This documentation
└── samples/
    └── musicxml-samples.js  # Embedded MusicXML data
```

## 🎵 Sample Sheets

### 1. Simple Melody - "Twinkle Twinkle Little Star"
- **Complexity**: Beginner
- **Elements**: Quarter notes, half notes, whole note, basic rhythm
- **Key Signature**: C major
- **Time Signature**: 4/4
- **Purpose**: Demonstrates basic note rendering and simple rhythms

### 2. Chord Progression - "C Am F G"
- **Complexity**: Intermediate  
- **Elements**: Chord symbols, harmony, eighth notes, dotted rhythms
- **Key Signature**: C major
- **Time Signature**: 4/4
- **Purpose**: Shows harmony notation and chord symbol display

### 3. Multi-Staff Composition - "Piano Piece"
- **Complexity**: Advanced
- **Elements**: Multiple staves, treble and bass clef, sixteenth notes, rests
- **Key Signature**: G major
- **Time Signature**: 4/4
- **Purpose**: Demonstrates complex multi-staff notation and different clefs

## ⚙️ Technical Implementation

### OSMD Configuration
The PoC uses optimized OSMD settings for best visual results:

```javascript
const osmdOptions = {
    autoResize: true,
    backend: 'svg',
    drawTitle: true,
    drawPartNames: true,
    coloringEnabled: true,
    defaultColorNotehead: '#1f77b4',
    defaultColorRest: '#d62728',
    defaultColorStem: '#2ca02c'
};
```

### Responsive Design
- **Desktop**: Full-featured layout with detailed controls
- **Tablet**: Optimized button sizes and layouts
- **Mobile**: Stacked layout with touch-friendly controls

### Error Handling
- OSMD library loading failures
- Invalid MusicXML data handling  
- Rendering errors and recovery
- Network connectivity issues

## 🔧 Customization

### Adding New Sheets
To add new MusicXML samples:

1. **Edit** `samples/musicxml-samples.js`
2. **Add** a new entry to the `SAMPLE_MUSICXML` object:

```javascript
'your-sheet-key': {
    title: 'Your Sheet Title',
    description: 'Description of the musical content',
    complexity: 'Beginner|Intermediate|Advanced',
    elements: ['List', 'of', 'musical', 'elements'],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
    <!-- Your MusicXML content here -->
    `
}
```

3. **Add** the option to the HTML dropdown in `index.html`:

```html
<option value="your-sheet-key">Your Sheet Title</option>
```

### Styling Customization
Modify `style.css` to customize:
- Color scheme and themes
- Layout and spacing
- Typography and fonts
- Responsive breakpoints

### OSMD Settings
Adjust OSMD configuration in `script.js`:
- Rendering backend (SVG/Canvas)
- Color schemes
- Display options
- Zoom levels

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome**: 70+ ✅
- **Firefox**: 65+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅

### Known Issues
- Some older browsers may have limited SVG support
- Mobile browsers may require specific touch optimizations
- Internet Explorer is not supported

## 📱 Mobile Optimization

### Features
- Touch-friendly button sizes (44px minimum)
- Responsive breakpoints at 768px and 480px
- Optimized sheet zoom levels for small screens
- Stacked layout for narrow viewports

### Performance Tips
- Sheets automatically scale on mobile devices
- Lower zoom levels applied for better readability
- Efficient memory management prevents mobile crashes

## 🔍 Debugging

### Debug Console
Access debugging utilities in browser console:

```javascript
// Get current application state
OSMDDebug.getState()

// Clear current sheet
OSMDDebug.clearSheet()

// Render specific sheet
OSMDDebug.renderSheet('simple-melody')
```

### Common Issues

**Sheet not rendering**:
- Check browser console for errors
- Verify MusicXML validity
- Ensure OSMD library loaded

**Performance issues**:
- Try clearing and re-rendering
- Check for memory leaks in dev tools
- Reduce zoom level for complex sheets

**Mobile display problems**:
- Verify responsive CSS is loaded
- Check viewport meta tag
- Test touch interactions

## 📚 Educational Use

### Learning Objectives
This PoC demonstrates:
- MusicXML structure and format
- OSMD library integration patterns
- Responsive web design for music applications
- JavaScript event handling and DOM manipulation
- Error handling in music software

### Extension Ideas
- Add audio playback capabilities
- Implement sheet music editing features
- Create playlist functionality
- Add export/print options
- Integrate with music theory analysis

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Make changes to the PoC files
3. Test across different browsers and devices
4. Submit pull request with detailed description

### Code Style
- Use ES6+ features where supported
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Maintain responsive design principles

## 📄 License

This Proof of Concept is provided as educational material. OpenSheetMusicDisplay is subject to its own license terms.

## 🔗 Resources

- [OpenSheetMusicDisplay Documentation](https://opensheetmusicdisplay.org/)
- [MusicXML Specification](https://www.musicxml.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [SVG Documentation](https://developer.mozilla.org/en-US/docs/Web/SVG)

## 📞 Support

For questions about this PoC:
1. Check the browser console for error messages
2. Verify all files are properly loaded
3. Test with a different browser
4. Review the sample MusicXML format

---

**Next Steps**: This PoC serves as a foundation for building more complex music notation applications. Consider integrating with audio playback, MIDI support, or collaborative editing features for a complete music platform.