package arc

import (
	"fmt"
	"os"
)

type FileActionError struct {
	FilePaths []string
	Err       error
}

func (fa *FileActionError) Error() string {
	return fa.Err.Error()
}

func (fa *FileActionError) Unwrap() error {
	return fa.Err
}

func rename(oldPath, newPath string) error {
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		return &FileActionError{
			FilePaths: []string{oldPath},
			Err:       fmt.Errorf("%s does not exist", oldPath),
		}
	}
	if _, err := os.Stat(newPath); !os.IsNotExist(err) {
		return &FileActionError{
			FilePaths: []string{oldPath, newPath},
			Err:       fmt.Errorf("%s already exists", newPath),
		}
	}
	err := os.Rename(oldPath, newPath)
	if err != nil {
		return &FileActionError{
			FilePaths: []string{oldPath, newPath},
			Err:       err,
		}
	}
	return nil
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
