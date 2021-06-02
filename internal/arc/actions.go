package arc

import (
	"fmt"
	"os"
)

func rename(oldPath, newPath string) error {
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		return fmt.Errorf("cannot %s (does not exist)", oldPath)
	}
	if _, err := os.Stat(newPath); !os.IsNotExist(err) {
		return fmt.Errorf("cannot rename to %s (already exists)", newPath)
	}
	return os.Rename(oldPath, newPath)
}

type RenameAction struct {
	OldPath string
	NewPath string
}

func (ra *RenameAction) Do() error {
	return rename(ra.OldPath, ra.NewPath)
}

func (ra *RenameAction) Undo() error {
	return rename(ra.NewPath, ra.OldPath)
}
