  // Log top result for debugging
  if (top10.length > 0) {
    console.log(`[SEARCH] Top result: ${top10[0].url} = ${top10[0].score}`);
  }

    // Debug logging
  console.log(`[SEARCH] Dataset: ${datasetName}, Query: "${query}"`);
  console.log(`[SEARCH] Total docs: ${pages.length}, Original query words: ${queryWords.length}, Filtered unique: ${filteredQueryWords.length}`);
  if (Object.keys(originalWordCounts).length !== filteredQueryWords.length) {
    const removed = Object.keys(originalWordCounts).filter(w => !filteredQueryWords.includes(w));
    console.log(`[SEARCH] Removed words with IDF=0: ${removed.join(', ')}`);
  }