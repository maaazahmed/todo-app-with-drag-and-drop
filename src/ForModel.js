import $ from 'jquery'
import modal from 'materialize-css'
import'jquery/dist/jquery.slim'
export function modal(){
  $(document).ready(function(){
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal('open');
  });

}