# Adult Content Platform

A modern, responsive website that integrates with the Eporner API v2 to provide a comprehensive video browsing and playback experience.

## 🚀 Features

### ✨ Core Features
- **Multi-Page Structure**: Individual pages for each content category
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Inline Video Player**: Watch videos directly on the website without external redirects
- **Advanced Search**: Powerful search functionality with multiple filters
- **Category-Based Browsing**: 12 different content categories
- **Pagination**: Browse through large collections of videos
- **Modern UI/UX**: Beautiful, professional design with smooth animations

### 🎯 Content Categories
1. **Teen** - Young adult content
2. **MILF** - Mature women content
3. **Asian** - Asian adult content
4. **Amateur** - Homemade content
5. **Anal** - Anal sex content
6. **Mature** - Mature adult content
7. **Lesbian** - Girl on girl content
8. **Ebony** - Black women content
9. **Hentai** - Animated adult content
10. **Creampie** - Internal finish content
11. **Threesome** - Three person content
12. **Outdoor** - Outside location content

## 📁 File Structure

```
AdultPlatform/
├── index.html              # Home page with search functionality
├── categories.html         # Category index page
├── popular.html           # Popular videos page
├── latest.html            # Latest videos page
├── teen.html              # Teen category page
├── milf.html              # MILF category page
├── asian.html             # Asian category page
├── amateur.html           # Amateur category page
├── anal.html              # Anal category page
├── mature.html             # Mature category page
├── lesbian.html           # Lesbian category page
├── ebony.html             # Ebony category page
├── hentai.html            # Hentai category page
├── creampie.html          # Creampie category page
├── threesome.html         # Threesome category page
├── outdoor.html           # Outdoor category page
├── script.js              # Main JavaScript functionality
├── categories.js          # Categories page JavaScript
├── teen.js                # Teen category JavaScript
├── milf.js                # MILF category JavaScript
├── asian.js               # Asian category JavaScript
├── amateur.js             # Amateur category JavaScript
├── anal.js                # Anal category JavaScript
├── mature.js               # Mature category JavaScript
├── lesbian.js             # Lesbian category JavaScript
├── ebony.js               # Ebony category JavaScript
├── hentai.js              # Hentai category JavaScript
├── creampie.js            # Creampie category JavaScript
├── threesome.js           # Threesome category JavaScript
├── outdoor.js             # Outdoor category JavaScript
├── popular.js             # Popular videos JavaScript
├── latest.js              # Latest videos JavaScript
├── styles.css             # Main stylesheet
└── README.md              # This file
```

## 🔧 API Integration

### Eporner API v2 Documentation

The website integrates with the Eporner API v2 to fetch video content. All API calls are made to the following endpoints:

#### Base URL
```
https://www.eporner.com/api/v2/
```

### API Endpoints

#### 1. Search Videos
**Endpoint:** `/video/search/`
**Method:** GET

**Parameters:**
- `query` (string): Search query (e.g., "teen", "milf", "asian")
- `per_page` (integer): Number of results per page (1-1000, default: 30)
- `page` (integer): Page number (default: 1)
- `thumbsize` (string): Thumbnail size - "small", "medium", "big" (default: "medium")
- `order` (string): Sort order:
  - `latest` - Newest videos first
  - `longest` - Longest videos first
  - `shortest` - Shortest videos first
  - `top-rated` - Top rated videos first
  - `most-popular` - Most popular all time
  - `top-weekly` - Most popular this week
  - `top-monthly` - Most popular this month
- `gay` (integer): Include adult content - 0=no, 1=yes, 2=only (default: 0)
- `lq` (integer): Include low quality content - 0=no, 1=yes, 2=only (default: 1)
- `format` (string): Response format - "json" or "xml" (default: "json")

**Example Request:**
```
GET https://www.eporner.com/api/v2/video/search/?query=teen&per_page=20&page=1&thumbsize=big&order=top-weekly&gay=1&format=json
```

#### 2. Get Video Details
**Endpoint:** `/video/id/`
**Method:** GET

**Parameters:**
- `id` (string, **required**): Video ID
- `thumbsize` (string): Thumbnail size - "small", "medium", "big" (default: "medium")
- `format` (string): Response format - "json" or "xml" (default: "json")

**Example Request:**
```
GET https://www.eporner.com/api/v2/video/id/?id=IsabYDAiqXa&thumbsize=medium&format=json
```

#### 3. Get Removed Videos
**Endpoint:** `/video/removed/`
**Method:** GET

**Parameters:**
- `format` (string): Response format - "json", "xml", or "txt" (default: "json")

**Example Request:**
```
GET https://www.eporner.com/api/v2/video/removed/?format=json
```

### API Response Format

#### Search Response (JSON)
```json
{
  "count": 20,
  "start": 0,
  "per_page": 20,
  "page": 1,
  "time_ms": 150,
  "total_count": 50000,
  "total_pages": 2500,
  "videos": [
    {
      "id": "IsabYDAiqXa",
      "title": "Video Title",
      "keywords": "tag1, tag2, tag3",
      "views": 123456,
      "rate": "4.25",
      "url": "https://www.eporner.com/video-title/",
      "added": "2024-01-15 10:30:00",
      "length_sec": 1800,
      "length_min": "30:00",
      "embed": "https://www.eporner.com/embed/video-id/",
      "default_thumb": {
        "size": "medium",
        "width": 427,
        "height": 240,
        "src": "https://static.eporner.com/thumbs/..."
      },
      "thumbs": [...]
    }
  ]
}
```

#### Video Details Response (JSON)
```json
{
  "id": "IsabYDAiqXa",
  "title": "Video Title",
  "keywords": "tag1, tag2, tag3",
  "views": 123456,
  "rate": "4.25",
  "url": "https://www.eporner.com/video-title/",
  "added": "2024-01-15 10:30:00",
  "length_sec": 1800,
  "length_min": "30:00",
  "embed": "https://www.eporner.com/embed/video-id/",
  "default_thumb": {
    "size": "medium",
    "width": 427,
    "height": 240,
    "src": "https://static.eporner.com/thumbs/..."
  },
  "thumbs": [...]
}
```

## 🛠️ Setup Instructions

### Prerequisites
- Web server (Apache, Nginx, or any HTTP server)
- Modern web browser with JavaScript enabled

### Installation
1. **Clone or download** the project files to your web server directory
2. **Ensure all files** are in the same directory
3. **Open `index.html`** in your web browser
4. **Test the website** functionality

### Local Development
For local development, you can use any of these methods:

**Method 1: Python HTTP Server**
```bash
cd /path/to/AdultPlatform
python -m http.server 8000
```
Then visit `http://localhost:8000`

**Method 2: Node.js HTTP Server**
```bash
cd /path/to/AdultPlatform
npx http-server
```

**Method 3: PHP Built-in Server**
```bash
cd /path/to/AdultPlatform
php -S localhost:8000
```

## 📖 Usage Guide

### Navigation
- **Home Page**: Search for videos or browse featured content
- **Categories**: Browse all 12 content categories
- **Popular**: View most popular and trending videos
- **Latest**: Discover newest videos added to the platform

### Searching Videos
1. Enter search terms in the search box
2. Use filters to refine results:
   - Sort by: Latest, Top Rated, Most Popular, etc.
   - Thumbnail size: Small, Medium, Large
   - Content type: Regular, Adult, or Both

### Browsing Categories
1. Visit the Categories page or use the dropdown menu
2. Click on any category to view videos in that category
3. Use filters to sort videos within each category
4. Browse multiple pages using pagination

### Video Playback
1. Click on any video thumbnail
2. Video will play inline in a modal overlay
3. Use video controls for play/pause, volume, and fullscreen
4. View video information in the info panel below the player

## 🎨 Customization

### Styling
- Edit `styles.css` to customize colors, fonts, and layout
- All CSS is organized with clear comments
- Responsive breakpoints are defined for mobile optimization

### Adding New Categories
1. Create `new-category.html` following the template structure
2. Create `new-category.js` with the appropriate API query
3. Add the new category to all navigation dropdowns
4. Update the main pages to include the new category link

### Modifying API Parameters
- Edit the search parameters in each JavaScript file
- Common modifications:
  - Change `per_page` for different result counts
  - Modify `thumbsize` for different thumbnail sizes
  - Adjust `order` for different sorting options

## 🔒 Security & Privacy

### Content Filtering
- The website includes options to filter adult content
- Users can choose to include or exclude adult material
- All content is loaded from the Eporner API

### Data Usage
- No personal data is collected or stored
- All API calls are made client-side
- No cookies or tracking scripts are used

## 🚀 Performance Optimization

### Features Implemented
- **Lazy Loading**: Images load only when needed
- **Efficient API Calls**: Minimal requests with proper error handling
- **Responsive Images**: Appropriate sizes for different devices
- **Caching**: Browser caching for static assets

### Best Practices
- **Clean Code**: Well-organized, commented code
- **Error Handling**: Comprehensive error management
- **Mobile First**: Responsive design approach
- **Accessibility**: Semantic HTML and proper ARIA labels

## 🔧 Troubleshooting

### Common Issues

**Category buttons not working:**
- Ensure JavaScript is enabled in your browser
- Check browser console for error messages
- Verify all files are properly uploaded

**Videos not loading:**
- Check internet connection
- Verify Eporner API is accessible
- Check browser console for API errors

**Mobile navigation not working:**
- Ensure touch events are enabled
- Check if JavaScript is loaded properly
- Verify CSS is loading correctly

### Debug Mode
Enable debug mode by opening browser console (F12) and checking for error messages. The website includes extensive logging for troubleshooting.

## 📝 License & Disclaimer

### Educational Purpose
This project is created for **educational and development purposes only**. It demonstrates:
- Modern web development techniques
- API integration
- Responsive design
- JavaScript functionality

### Content Disclaimer
- All video content is provided by the Eporner API
- The website does not host or store any video content
- Users are responsible for complying with local laws and regulations
- Content may include adult material - viewer discretion is advised

## 🤝 Contributing

### Code Style
- Use consistent indentation (4 spaces)
- Follow JavaScript ES6+ standards
- Comment complex functions and API calls
- Use semantic HTML elements

### Adding Features
1. Create a feature branch
2. Implement the new functionality
3. Test across different devices and browsers
4. Submit a pull request with detailed description

## 📞 Support

For technical support or questions about the codebase:
- Check the browser console for error messages
- Verify all files are properly loaded
- Ensure API endpoints are accessible
- Test on different browsers and devices

---

**Built with ❤️ using modern web technologies**

*This project demonstrates professional web development practices and API integration techniques.*
