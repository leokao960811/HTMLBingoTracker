import pandas as pd
import sys
import argparse
import json

def main():
    parse= argparse.ArgumentParser(description=__doc__)
    parse.add_argument("csv", help="The CSV file to convert.")
    parse.add_argument("out", help="The output JSON file, e.g. banks/mybank.json.")
    parse.add_argument("--column", default="QUESTION", help="The column name that holds the responses (default: 'QUESTION').")
    parse.add_argument("--credits", default="", help="Optional; Text credits for the bank.")
    args = parse.parse_args()

    df= pd.read_csv(args.csv,encoding="utf-8-sig",dtype=str)

    if(args.column not in df.columns):
        sys.exit(f"Column '{args.column}' not found, Columns are:{list(df.columns)}")

    phrases= []
    seen=set()
    for raw in df[args.column].dropna():
        text=" ".join(raw.split())
        key=text.casefold()
        if (text and key not in seen):
            seen.add(key)
            phrases.append(text)

    bank={"credits": args.credits, "phrases": phrases}

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)    
        f.write("\n")

    print(f"{len(df)} responses -> {len(phrases)} phrases written to {args.out}")
    if(len(phrases) < 24):
        print("Warning: Less than 24 phrases, the bank may not be usable.")

if __name__ == "__main__":
    main()