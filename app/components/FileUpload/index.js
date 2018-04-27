import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import FileIcon from '@material-ui/icons/AttachFile';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';

import { isImage } from './helpers/helpers.js';

const styles = {
  dropzoneTextStyle: {
    textAlign: "center",
    top: "25%",
    position: "relative",
  },
  uploadIconSize: {
    width: "51px !important",
    height: "51px !important",
    color: "#909090 !important",
  },
  dropzoneParagraph: {
    fontSize: "24px",
  },

  dropZone: {
    position: "relative",
    width: "100%",
    height: "250px",
    backgroundColor: "#F0F0F0",
    border: "dashed",
    borderColor: "#C8C8C8",
    cursor: "pointer",
  },
  stripes: {
    width: "100%",
    height: "250px",
    cursor: "pointer",
    border: "solid",
    borderColor: "#C8C8C8",
    backgroundImage: "repeating-linear-gradient(-45deg, #F0F0F0, #F0F0F0 25px, #C8C8C8 25px, #C8C8C8 50px)",
    WebkitAnimation: "progress 2s linear infinite !important",
    MozAnimation: "progress 2s linear infinite !important",
    animation: "progress 2s linear infinite !important",
    backgroundSize: "150% 100%",
  },
  rejectStripes: {
    width: "100%",
    height: "250px",
    cursor: "pointer",
    border: "solid",
    borderColor: "#C8C8C8",
    backgroundImage: "repeating-linear-gradient(-45deg, #fc8785, #fc8785 25px, #f4231f 25px, #f4231f 50px)",
    WebkitAnimation: "progress 2s linear infinite !important",
    MozAnimation: "progress 2s linear infinite !important",
    animation: "progress 2s linear infinite !important",
    backgroundSize: "150% 100%",
  },
  fileIconImg: {
    color: "#909090 !important",
  },
  smallPreviewImg: {
    height: "100px !important",
    width: "initial !important",
    maxWidth: "100%",
    marginTop: "5px",
    marginRight: "10px",
    color: "rgba(0, 0, 0, 0.87)",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms !important",
    boxSizing: "border-box",
    WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
    boxShadow: "rgba(0, 0, 0, 0.12) 0 1px 6px, rgba(0, 0, 0, 0.12) 0 1px 4px !important",
    borderRadius: "2px",
    zIndex: "5",
  },
  imageContainer: {
    position: "relative",
    zIndex: "10",
  },
  removeBtn: {
    color: "white",
    marginLeft: "5px",
    zIndex: "3",
  },
  middle: {
    transition: ".5s ease",
    opacity: "0",
    position: "absolute",
    top: "20px",
    left: "5px",
    transform: "translate(-50%, -50%)",
    MsTransform: "translate(-50%, -50%)",
  },
  row: {
    marginRight: "-0.5rem",
    marginLeft: "-0.5rem",
    boxSizing: "border-box",
    display: "-webkit-box",
    display: "-ms-flexbox",
    display: "flex",
    flex: "0 1 auto",
    WebkitBoxFlex: "0",
    MsFlex: "0 1 auto",
    WebkitBoxOrient: "horizontal",
    WebkitBoxDirection: "normal",
    MsFlexDirection: "row",
    flexDirection: "row",
    MsFlexWrap: "wrap",
    flexWrap: "wrap",
  },
}

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      openSnackBar: false,
      errorMessage: '',
      files: this.props.files || [],
      disabled: true,
      acceptedFiles: this.props.acceptedFiles ||
      [
        'image/jpeg',
        'image/png',
        'image/bmp',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
      ],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
      files: nextProps.files,
    });
  }

  handleClose = () => {
    this.props.closeDialog();
    this.setState({ open: false });
  }

  onDrop = (files) => {
    let oldFiles = this.state.files;
    const filesLimit = this.props.filesLimit || '3';

    oldFiles = oldFiles.concat(files);
    if (oldFiles.length > filesLimit) {
      this.setState({
        openSnackBar: true,
        errorMessage: 'Cannot upload more then ' + filesLimit + ' items.',
      });
    } else {
      this.setState(
        {
          files: oldFiles,
        }, 
        this.changeButtonDisable
      );
    }
  }

  handleRemove = (file, fileIndex) => e => {
    const files = this.state.files;
    // This is to prevent memory leaks.
    window.URL.revokeObjectURL(file.preview);

    files.splice(fileIndex, 1);
    this.setState(files, this.changeButtonDisable);

    if (file.path) {
      this.props.deleteFile(file);
    }
  }

  changeButtonDisable = () => {
    if (this.state.files.length !== 0) {
      this.setState({
        disabled: false,
      });
    } else {
      this.setState({
        disabled: true,
      });
    }
  }

  saveFiles = () => {
    const filesLimit = this.props.filesLimit || '3';

    if (this.state.files.length > filesLimit) {
      this.setState({
        openSnackBar: true,
        errorMessage: 'Cannot upload more then ' + filesLimit + ' items.',
      });
    } else {
      this.props.saveFiles(this.state.files);
    }
  }

  onDropRejected = () => {
    this.setState({
      openSnackBar: true,
      errorMessage: 'File too big, max size is 3MB',
    });
  }

  handleRequestCloseSnackBar = () => {
    this.setState({
      openSnackBar: false,
    });
  }

  render() {
    const { classes } = this.props;
    let img;
    let previews = '';
    const fileSizeLimit = this.props.maxSize || 3000000;

    if (this.props.showPreviews === true) {
      previews = this.state.files.map((file, i) => {
        const path = file.preview || '/pic' + file.path;

        if (isImage(file)) {
          //show image preview.
          img = <img className={classes.smallPreviewImg} src={path}/>;
        } else {
          //Show default file image in preview.
          img = <FileIcon className={classes.smallPreviewImg} />;
        }

        return (<div>
          <div className={classes.imageContainerColFileIconImg} key={i}>
            {img}
            <div className={classes.middle}>
              <IconButton
                className={classes.removeBtn}
                aria-label="Delete"
                onTouchTap={this.handleRemove(file, i)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        </div>);
      });
    }
    return (
      <div>
        <Dialog
          modal={false}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="dropzone-dialog"
        >
          <DialogTitle id="dropzone-dialog">Upload File</DialogTitle>
          <DialogContent>
            <Dropzone
              accept={this.state.acceptedFiles.join(',')}
              onDrop={this.onDrop}
              className={classes.dropZone}
              acceptclassName={classes.stripes}
              rejectclassName={classes.rejectStripes}
              onDropRejected={this.onDropRejected}
              maxSize={fileSizeLimit}
            >
              <div className={classes.dropzoneTextStyle}>
                <p className={classes.dropzoneParagraph}>'Drag and drop an image file here or click'</p>
                <br/>
                <CloudUploadIcon className={classes.uploadIconSize}/>
              </div>
            </Dropzone>
            <br/>
            <div className={classes.row}>
              {this.state.files.length ? <span>Preview:</span> : ''}
            </div>
            <div className={classes.row}>
              {previews}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={this.handleClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={this.state.disabled}
              onClick={this.saveFiles}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={this.state.openSnackBar}
          message={this.state.errorMessage}
          autoHideDuration={4000}
          onClose={this.handleRequestCloseSnackBar}
        />
      </div>
    );
  }
}

FileUpload.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileUpload);