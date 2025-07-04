import { Seq } from "..";
import { guessType } from "../utils";

export default (text: string, fileName: string): Seq[] => {
  // partFactory returns a negative "circular" prop, we assume they're all linear
  if (text.trim().startsWith("@")) {
    return text
      .split("@") // split up if it's a multi-seq FASTA file
      .map(t => {
        // this starts at the end of the first line, grabs all other characters,
        // and removes any newlines (leaving only the original sequence)
        // sequence "cleaning" happens in complement (we don't support bps other than
        // the most common right now)
        // for FASTQ, the sequence is between the first newline and the next plus sign
        // the sequence following the plus sign is the quality score, which we ignore for now
        const seq = t.substr(t.indexOf("\n"), t.indexOf("+") === -1 ? t.length : t.indexOf("+")).replace(/\s/g, "");

        // the first line contains the name, though there's lots of variability around
        // the information on this line...
        // >MCHU - Calmodulin - Human, rabbit, bovine, rat, and chicken
        const name = t.substring(0, t.search(/\n|\|/)).replace(/\//g, "");

        return {
          annotations: [],
          name,
          seq,
          type: guessType(seq),
        };
      })
      .filter(p => p.name && p.seq);
  }

  // assume that it's a no name FASTA. Ie it's just a file with dna and no header
  // try and get the name from the fileName
  const lastChar = fileName.lastIndexOf(".") || fileName.length;
  const name = fileName.substring(0, lastChar) || "Untitled";
  const seq = text;
  return [
    {
      annotations: [],
      name,
      seq,
      type: guessType(seq),
    },
  ];
};
