/**
 * Book management service for importing and parsing EPUB files
 */
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File, Directory } from 'expo-file-system';
import JSZip from 'jszip';
import { Book, Chapter } from '../types';

const getBooksDir = () => new Directory(Paths.document, 'books');

/**
 * Ensure books directory exists
 */
async function ensureBooksDir(): Promise<void> {
  const booksDir = getBooksDir();
  if (!booksDir.exists) {
    booksDir.create({ intermediates: true });
  }
}

/**
 * Import an EPUB file from device storage
 */
export async function importBook(): Promise<Book | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/epub+zip',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const sourceUri = result.assets[0].uri;
    const sourceFile = new File(sourceUri);
    await ensureBooksDir();

    // Copy file to app storage
    const bookId = `book_${Date.now()}`;
    const booksDir = getBooksDir();
    const destFile = new File(booksDir, `${bookId}.epub`);
    
    // Use copy method from source file
    sourceFile.copy(destFile);

    // Parse EPUB metadata
    const metadata = await parseEpubMetadata(destFile.uri);

    const book: Book = {
      id: bookId,
      title: metadata.title || result.assets[0].name.replace('.epub', '') || 'Unknown Title',
      author: metadata.author || 'Unknown Author',
      coverUri: metadata.coverUri,
      filePath: destFile.uri,
      fileType: 'epub',
      chapters: metadata.chapters,
      addedAt: Date.now(),
    };

    return book;
  } catch (error) {
    console.error('Error importing book:', error);
    throw error;
  }
}

/**
 * Parse EPUB file to extract metadata and chapters
 */
export async function parseEpubMetadata(filePath: string): Promise<{
  title: string;
  author: string;
  coverUri?: string;
  chapters: Chapter[];
}> {
  try {
    // Read EPUB file as base64
    const file = new File(filePath);
    const base64 = await file.base64();

    const zip = new JSZip();
    await zip.loadAsync(base64, { base64: true });

    // Find and parse container.xml to get rootfile path
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    if (!containerXml) {
      throw new Error('Invalid EPUB: missing container.xml');
    }

    // Extract rootfile path (simple regex parsing)
    const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
    const rootfilePath = rootfileMatch?.[1] || 'OEBPS/content.opf';

    // Parse OPF file for metadata
    const opfContent = await zip.file(rootfilePath)?.async('text');
    if (!opfContent) {
      throw new Error('Invalid EPUB: missing OPF file');
    }

    // Extract metadata
    const title = extractTagContent(opfContent, 'dc:title') || 'Unknown Title';
    const author = extractTagContent(opfContent, 'dc:creator') || 'Unknown Author';

    // Extract chapters from spine
    const chapters = await extractChapters(zip, opfContent, rootfilePath);

    // Extract cover image
    const coverUri = await extractCover(zip, opfContent, rootfilePath, filePath);

    return { title, author, coverUri, chapters };
  } catch (error) {
    console.error('Error parsing EPUB:', error);
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      chapters: [],
    };
  }
}

/**
 * Extract text content from XML tag
 */
function extractTagContent(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() || null;
}

/**
 * Extract chapters from EPUB spine
 */
async function extractChapters(
  zip: JSZip,
  opfContent: string,
  opfPath: string
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

  // Find spine itemrefs
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  if (!spineMatch) return chapters;

  const itemrefMatches = spineMatch[1].matchAll(/idref="([^"]+)"/g);
  
  // Find manifest items
  const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
  if (!manifestMatch) return chapters;

  const itemMap = new Map<string, string>();
  const itemMatches = manifestMatch[1].matchAll(/id="([^"]+)"[^>]*href="([^"]+)"/g);
  for (const match of itemMatches) {
    itemMap.set(match[1], match[2]);
  }

  let index = 0;
  for (const itemref of itemrefMatches) {
    const id = itemref[1];
    const href = itemMap.get(id);
    if (!href) continue;

    const filePath = opfDir + href;
    const content = await zip.file(filePath)?.async('text');
    
    // Extract title from chapter content
    let title = `Chapter ${index + 1}`;
    if (content) {
      const titleMatch = content.match(/<title>([^<]+)<\/title>/i) ||
                        content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    chapters.push({
      id: `${id}_${index}`,
      title,
      index,
    });
    index++;
  }

  return chapters;
}

/**
 * Extract and save cover image
 */
async function extractCover(
  zip: JSZip,
  opfContent: string,
  opfPath: string,
  bookPath: string
): Promise<string | undefined> {
  try {
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    
    // Look for cover in meta or manifest
    const coverIdMatch = opfContent.match(/name="cover"\s+content="([^"]+)"/i) ||
                         opfContent.match(/<item[^>]*id="cover[^"]*"[^>]*href="([^"]+)"/i);
    
    if (!coverIdMatch) return undefined;

    let coverHref = coverIdMatch[1];
    
    // If it's an ID reference, look up the href
    if (!coverHref.includes('.')) {
      const hrefMatch = opfContent.match(new RegExp(`id="${coverHref}"[^>]*href="([^"]+)"`, 'i'));
      if (hrefMatch) {
        coverHref = hrefMatch[1];
      }
    }

    const coverPath = opfDir + coverHref;
    const coverData = await zip.file(coverPath)?.async('base64');
    
    if (!coverData) return undefined;

    // Determine file extension
    const ext = coverHref.split('.').pop() || 'jpg';
    
    // Construct cover file path using the same directory as the book
    // We can't easily do string manipulation on new File objects for sibling files without parent ref
    // So let's use the directory from the book path or just use the booksDir global since we know where it is
    const bookFile = new File(bookPath);
    // Note: bookPath comes from destFile.uri in importBook
    
    // Simplified: We know books go into booksDir. 
    // Just create a new file reference in booksDir.
    // However, bookPath might be absolute uri string.
    
    // Robust way: get filename from bookPath, replace extension
    const bookFileName = bookPath.split('/').pop();
    if (!bookFileName) return undefined;
    
    const coverFileName = bookFileName.replace('.epub', `_cover.${ext}`);
    const coverFile = new File(getBooksDir(), coverFileName);
    
    coverFile.write(coverData, {
      encoding: 'base64',
    });

    return coverFile.uri;
  } catch (error) {
    console.error('Error extracting cover:', error);
    return undefined;
  }
}

/**
 * Delete a book and its associated files
 */
export async function deleteBook(book: Book): Promise<void> {
  try {
    const bookFile = new File(book.filePath);
    if (bookFile.exists) {
      bookFile.delete();
    }
    
    if (book.coverUri) {
        const coverFile = new File(book.coverUri);
        if (coverFile.exists) {
            coverFile.delete();
        }
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}

/**
 * Get chapter content by index
 */
export async function getChapterContent(
  filePath: string,
  chapterIndex: number
): Promise<string> {
  try {
    const file = new File(filePath);
    const base64 = await file.base64();

    const zip = new JSZip();
    await zip.loadAsync(base64, { base64: true });

    // Get container.xml for rootfile
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    const rootfileMatch = containerXml?.match(/full-path="([^"]+)"/);
    const rootfilePath = rootfileMatch?.[1] || 'OEBPS/content.opf';

    const opfContent = await zip.file(rootfilePath)?.async('text');
    if (!opfContent) return '';

    const opfDir = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1);

    // Get spine items
    const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
    if (!spineMatch) return '';

    const itemrefs = [...spineMatch[1].matchAll(/idref="([^"]+)"/g)];
    const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
    if (!manifestMatch) return '';

    const itemMap = new Map<string, string>();
    const items = [...manifestMatch[1].matchAll(/id="([^"]+)"[^>]*href="([^"]+)"/g)];
    for (const item of items) {
      itemMap.set(item[1], item[2]);
    }

    if (chapterIndex >= itemrefs.length) return '';

    const href = itemMap.get(itemrefs[chapterIndex][1]);
    if (!href) return '';

    const chapterPath = opfDir + href;
    const content = await zip.file(chapterPath)?.async('text');
    
    // Strip HTML tags for plain text
    return content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  } catch (error) {
    console.error('Error getting chapter content:', error);
    return '';
  }
}
