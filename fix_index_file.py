#!/usr/bin/env python3
"""
Script to fix src/pages/Index.tsx by truncating it to exactly 1351 lines.
The file currently has duplicate content after line 1351 that needs to be removed.
"""

import os

def fix_index_file():
    file_path = 'src/pages/Index.tsx'
    
    print("=" * 60)
    print(" Fixing src/pages/Index.tsx - truncating to line 1351")
    print("=" * 60)
    print()
    
    # Read first 1351 lines
    print("Step 1: Reading first 1351 lines...")
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [next(f) for _ in range(1351)]
    print(f"✓ Read {len(lines)} lines")
    print()
    
    # Write back to file
    print("Step 2: Writing cleaned content back to file...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("✓ File written successfully")
    print()
    
    # Verify
    print("Step 3: Verifying last 5 lines...")
    with open(file_path, 'r', encoding='utf-8') as f:
        all_lines = f.readlines()
        print("===== Last 5 lines of src/pages/Index.tsx =====")
        for line in all_lines[-5:]:
            print(line.rstrip())
        print("=" * 48)
        print()
    
    print("Step 4: Verifying line count...")
    line_count = len(all_lines)
    print(f"===== Line count: {line_count} =====")
    print()
    
    if line_count == 1351 and all_lines[-1].strip() == '}':
        print("✓ File fix completed successfully!")
        print("The file now ends at line 1351 with closing brace '}'")
        return True
    else:
        print("⚠ Warning: File may not have been fixed correctly")
        print(f"Expected 1351 lines ending with '}', got {line_count} lines")
        return False

if __name__ == '__main__':
    try:
        success = fix_index_file()
        exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)
