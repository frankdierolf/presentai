import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// create a new record and upload multiple files
// (files must be Blob or File instances)
const createdRecord = await pb.collection('Markdown').create({
  markdown: [new File(['content 2.dgoindsopivbdsoubcdsoubweoufbdsaaicubdsfoudebf..'], 'file.md')],
});

console.log('Created record:', createdRecord);
