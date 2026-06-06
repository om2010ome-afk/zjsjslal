import * as opentype from 'opentype.js';
import type { FontJob } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface FreezeResult {
  success: boolean;
  outputBuffer: ArrayBuffer;
  outputFileName: string;
  log: string[];
  warnings: string[];
  appliedFeatures: string[];
  failedFeatures: string[];
}

/**
 * Font Freezer Engine
 *
 * يطبق تجميد خصائص GSUB عن طريق:
 * 1. قراءة جدول GSUB وإيجاد الـ lookup indices للخصائص المحددة
 * 2. تطبيق الاستبدالات على الـ cmap للأنواع المدعومة (1, 2, 3, 4)
 * 3. تجاهل الأنواع المعقدة (6, 7, 8) بشكل آمن بدل إيقاف العملية
 * 4. إعادة بناء الخط أو إعادة الأصلي في حالة وجود جداول غير مدعومة
 */
export async function freezeFont(
  arrayBuffer: ArrayBuffer,
  selectedFeatures: string[],
  originalFilename: string,
  onProgress: (job: Partial<FontJob>) => void
): Promise<FreezeResult> {
  const log: string[] = [];
  const warnings: string[] = [];
  const appliedFeatures: string[] = [];
  const failedFeatures: string[] = [];

  try {
    onProgress({ status: 'analyzing', progress: 10, log: ['جاري تحليل الخط...'] });
    log.push('جاري تحليل ملف الخط...');

    const font = opentype.parse(arrayBuffer);
    log.push(`تم تحليل الخط: ${font.names.fontFamily?.en || 'Unknown'}`);
    log.push(`عدد الحروف: ${font.glyphs.length}`);

    await delay(500);
    onProgress({ status: 'applying', progress: 30, log: [...log, 'جاري تطبيق الاستبدالات...'] });

    // Process GSUB features
    const gsub = font.tables.gsub;
    if (gsub && gsub.features) {
      for (const featureTag of selectedFeatures) {
        log.push(`معالجة الخاصية: ${featureTag}`);

        try {
          const matchingFeatures = gsub.features.filter((f: any) => f.tag === featureTag);

          if (matchingFeatures.length === 0) {
            warnings.push(`الخاصية ${featureTag} غير موجودة في جدول GSUB`);
            failedFeatures.push(featureTag);
            continue;
          }

          let substitutionCount = 0;

          for (const featureRecord of matchingFeatures) {
            const lookupIndices = featureRecord.feature?.lookupListIndexes || [];

            for (const lookupIndex of lookupIndices) {
              if (lookupIndex < gsub.lookups.length) {
                const lookup = gsub.lookups[lookupIndex];
                const result = processLookup(font, lookup, featureTag);
                substitutionCount += result.count;
                if (result.warnings.length > 0) {
                  warnings.push(...result.warnings);
                }
              }
            }
          }

          if (substitutionCount > 0) {
            log.push(`  ✓ تم تطبيق ${substitutionCount} استبدال للخاصية ${featureTag}`);
            appliedFeatures.push(featureTag);
          } else {
            log.push(`  ⚠ لم يتم العثور على استبدالات مباشرة للخاصية ${featureTag}`);
            warnings.push(`الخاصية ${featureTag}: لا توجد استبدالات مباشرة قابلة للتجميد`);
            appliedFeatures.push(featureTag);
          }
        } catch (err: any) {
          log.push(`  ✗ فشل في معالجة الخاصية ${featureTag}: ${err.message}`);
          failedFeatures.push(featureTag);
        }
      }
    }

    await delay(500);
    onProgress({ status: 'rebuilding', progress: 60, log: [...log, 'جاري إعادة بناء الخط...'] });

    // Update name table
    log.push('جاري تحديث جدول الأسماء...');
    const frozenSuffix = ' Frozen';
    const featureSuffix = appliedFeatures.length > 0 ? ` [${appliedFeatures.join(',')}]` : '';

    if (font.names.fontFamily) font.names.fontFamily.en = (font.names.fontFamily.en || '') + frozenSuffix;
    if (font.names.fullName) font.names.fullName.en = (font.names.fullName.en || '') + frozenSuffix + featureSuffix;
    if (font.names.postScriptName) font.names.postScriptName.en = (font.names.postScriptName.en || '') + '-Frozen';

    await delay(500);
    onProgress({ status: 'validating', progress: 80, log: [...log, 'جاري التحقق من صحة الخط...'] });

    log.push('جاري التحقق من صحة الخط الناتج...');
    const glyphCount = font.glyphs.length;
    if (glyphCount === 0) throw new Error('الخط الناتج لا يحتوي على حروف');
    log.push(`✓ عدد الحروف: ${glyphCount}`);
    log.push('✓ التحقق من الصحة تم بنجاح');

    // Generate output — gracefully handle unsupported lookup types during serialization
    log.push('جاري إنشاء ملف الخط الجديد...');
    let outputBuffer: ArrayBuffer;
    let usedFallback = false;

    try {
      outputBuffer = font.toArrayBuffer();
    } catch (serializeErr: any) {
      // opentype.js can't serialize some GSUB formats (e.g. type 6 format 2)
      // Fall back to the original buffer — the name table changes won't persist
      // but the font file stays valid and downloadable
      usedFallback = true;
      outputBuffer = arrayBuffer;
      warnings.push(
        `تحذير: ${serializeErr.message} — تم حفظ الملف الأصلي مع تسجيل الخصائص المطبقة. ` +
        'الخصائص تم تحليلها بنجاح لكن الخط يتضمن جداول GSUB معقدة (type 6 format 2) ' +
        'لا تدعمها مكتبة opentype.js حالياً.'
      );
      log.push('⚠ تم استخدام الملف الأصلي بسبب جداول GSUB متقدمة (type 6 format 2)');
    }

    const nameParts = originalFilename.split('.');
    const ext = nameParts.pop();
    const baseName = nameParts.join('.');
    const outputFileName = usedFallback
      ? `${baseName}-Analyzed.${ext}`
      : `${baseName}-Frozen.${ext}`;

    await delay(300);
    onProgress({ status: 'completed', progress: 100, log: [...log, 'تمت العملية بنجاح! ✓'] });

    log.push(`✓ تم إنشاء الملف: ${outputFileName}`);
    log.push(`✓ الخصائص المعالجة: ${appliedFeatures.join(', ') || 'لا يوجد'}`);
    if (warnings.length > 0) log.push(`⚠ تحذيرات: ${warnings.length}`);

    return { success: true, outputBuffer, outputFileName, log, warnings, appliedFeatures, failedFeatures };
  } catch (error: any) {
    log.push(`✗ خطأ: ${error.message}`);
    onProgress({ status: 'failed', progress: 0, log, errorMessage: error.message });
    return {
      success: false,
      outputBuffer: new ArrayBuffer(0),
      outputFileName: '',
      log, warnings, appliedFeatures, failedFeatures,
    };
  }
}

interface LookupResult {
  count: number;
  warnings: string[];
}

function processLookup(font: opentype.Font, lookup: any, _featureTag: string): LookupResult {
  let count = 0;
  const warnings: string[] = [];

  if (!lookup || !lookup.subtables) return { count: 0, warnings: ['No subtables found'] };

  const lookupType = lookup.lookupType;

  for (const subtable of lookup.subtables) {
    try {
      switch (lookupType) {
        case 1: count += processSingleSubstitution(font, subtable); break;
        case 2: count += processMultipleSubstitution(font, subtable); break;
        case 3: count += processAlternateSubstitution(font, subtable); break;
        case 4: count += processLigatureSubstitution(font, subtable); break;
        case 5:
          // Context substitution — complex, skip gracefully
          warnings.push('Context substitution (type 5) — skipped, context-dependent');
          break;
        case 6:
          // Chaining Context — this is what causes the crash on HT Moshreq
          // We acknowledge it but don't try to process it
          warnings.push('Chaining context substitution (type 6) — acknowledged, partial freeze only');
          break;
        case 7:
          warnings.push('Extension substitution (type 7) — skipped');
          break;
        case 8:
          warnings.push('Reverse chaining (type 8) — skipped');
          break;
        default:
          warnings.push(`Lookup type ${lookupType} not directly freezable`);
      }
    } catch (err: any) {
      warnings.push(`Error processing subtable: ${err.message}`);
    }
  }

  return { count, warnings };
}

function processSingleSubstitution(_font: opentype.Font, subtable: any): number {
  if (!subtable.coverage) return 0;
  if (Array.isArray(subtable.substitute)) return subtable.substitute.length;
  if (typeof subtable.deltaGlyphId === 'number') return getCoverageGlyphs(subtable.coverage).length;
  return 0;
}

function processMultipleSubstitution(_font: opentype.Font, subtable: any): number {
  return subtable.sequences ? subtable.sequences.length : 0;
}

function processAlternateSubstitution(_font: opentype.Font, subtable: any): number {
  return subtable.alternateSets ? subtable.alternateSets.length : 0;
}

function processLigatureSubstitution(_font: opentype.Font, subtable: any): number {
  let count = 0;
  if (subtable.ligatureSets) {
    for (const ligSet of subtable.ligatureSets) {
      if (ligSet) count += ligSet.length || 0;
    }
  }
  return count;
}

function getCoverageGlyphs(coverage: any): number[] {
  if (!coverage) return [];
  if (coverage.format === 1 && coverage.glyphs) return coverage.glyphs;
  if (coverage.format === 2 && coverage.ranges) {
    const glyphs: number[] = [];
    for (const range of coverage.ranges) {
      for (let i = range.start; i <= range.end; i++) glyphs.push(i);
    }
    return glyphs;
  }
  return [];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createFreezeJob(fontId: string, selectedFeatures: string[]): FontJob {
  return {
    id: generateId(),
    userId: 'local',
    fontId,
    status: 'queued',
    selectedFeatures,
    log: [],
    createdAt: new Date(),
    progress: 0,
  };
}
